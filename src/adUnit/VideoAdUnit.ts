import {linearEvents} from '../tracker'
import {getViewable} from '../vastSelectors'
import type {VastChain, VastIcon} from '../types'
import {VideoAdContainer} from '../adContainer'
import {finish} from './adUnitEvents'
import {
  onElementVisibilityChange,
  onElementResize
} from './helpers/dom/elementObservers'
import {preventManualProgress} from './helpers/dom/preventManualProgress'
import {Emitter, type Listener} from './helpers/Emitter'
import {retrieveIcons} from './helpers/icons/retrieveIcons'
import {addIcons, type AddedIcons} from './helpers/icons/addIcons'
import {viewmode} from './helpers/vpaid/viewmode'
import {safeCallback} from './helpers/safeCallback'
import {AdUnitError} from './helpers/adUnitError'

const {start, viewable, notViewable, viewUndetermined, iconClick, iconView} =
  linearEvents

const VIEWABLE_IMPRESSION_TIMEOUT = 2000

const _private = Symbol('_private')
export const _protected = Symbol('_protected')

interface Size {
  width: number
  height: number
  viewmode: string
}

interface Private {
  addIcons(): void
  setupViewableImpression(): void
  setupViewability(): void
  setupResponsive(): void
  handleViewableImpression(event: string): void
}

interface Protected extends Partial<AddedIcons> {
  started: boolean
  viewable: boolean
  finished: boolean
  size?: Size
  finish(): void
  onErrorCallbacks: Listener[]
  onFinishCallbacks: Listener[]
  throwIfCalled(): void
  throwIfFinished(): void
}

/**
 * Options map to create a {@link VideoAdUnit}
 */
export interface VideoAdUnitOptions {
  /**
   * Optional logger instance. Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   * Defaults to `window.console`
   */
  logger?: Console
  /**
   * if true it will pause the ad whenever is not visible for the viewer.
   * Defaults to `false`
   */
  viewability?: boolean
  /**
   * if true it will resize the ad unit whenever the ad container changes sizes
   * Defaults to `false`
   */
  responsive?: boolean
  /**
   * if true it will pause the ad unit whenever a user click on the ad
   * Defaults to `true`
   */
  pauseOnAdClick?: boolean
}

/**
 * This class provides shared logic among all the ad units.
 */
export class VideoAdUnit extends Emitter {
  private [_private]: Private = {
    addIcons: () => {
      if (!this.icons) {
        return
      }

      const {drawIcons, hasPendingIconRedraws, removeIcons} = addIcons(
        this.icons,
        {
          logger: this.logger,
          onIconClick: (icon) =>
            this.emit(iconClick, {
              adUnit: this,
              data: icon,
              type: iconClick
            }),
          onIconView: (icon) =>
            this.emit(iconView, {
              adUnit: this,
              data: icon,
              type: iconView
            }),
          videoAdContainer: this.videoAdContainer
        }
      )

      this[_protected].drawIcons = drawIcons
      this[_protected].removeIcons = removeIcons
      this[_protected].hasPendingIconRedraws = hasPendingIconRedraws
      this[_protected].onFinishCallbacks.push(removeIcons)
    },

    setupViewableImpression: () => {
      let timeoutId: number

      const unsubscribe = onElementVisibilityChange(
        this.videoAdContainer.element,
        (visible) => {
          if (this.isFinished() || this[_protected].viewable) {
            return
          }

          if (typeof visible !== 'boolean') {
            this[_private].handleViewableImpression(viewUndetermined)

            return
          }

          if (visible) {
            timeoutId = window.setTimeout(
              this[_private].handleViewableImpression,
              VIEWABLE_IMPRESSION_TIMEOUT,
              viewable
            )
          } else {
            clearTimeout(timeoutId)
          }
        },
        {viewabilityOffset: 0.5}
      )

      this[_protected].onFinishCallbacks.push(() => {
        unsubscribe()
        clearTimeout(timeoutId)

        if (!this[_protected].viewable) {
          this[_private].handleViewableImpression(notViewable)
        }
      })
    },

    handleViewableImpression: (event) => {
      this[_protected].viewable = Boolean(event)

      this.emit(event, {
        adUnit: this,
        type: event
      })
    },

    setupViewability: () => {
      const unsubscribe = onElementVisibilityChange(
        this.videoAdContainer.element,
        (visible) => {
          if (this.isFinished()) {
            return
          }

          if (typeof visible === 'boolean') {
            if (visible) {
              this.resume()
            } else {
              this.pause()
            }
          }
        }
      )

      this[_protected].onFinishCallbacks.push(unsubscribe)
    },

    setupResponsive: () => {
      const {element} = this.videoAdContainer

      this[_protected].size = {
        height: element.clientHeight,
        viewmode: viewmode(element.clientWidth, element.clientHeight),
        width: element.clientWidth
      }

      const unsubscribe = onElementResize(element, () => {
        if (this.isFinished()) {
          return
        }

        const previousSize = this[_protected].size
        const height = element.clientHeight
        const width = element.clientWidth

        if (height !== previousSize?.height || width !== previousSize?.width) {
          this.resize(width, height, viewmode(width, height))
        }
      })

      this[_protected].onFinishCallbacks.push(unsubscribe)
    }
  }

  protected [_protected]: Protected = {
    finished: false,
    started: false,
    viewable: false,
    onErrorCallbacks: [],
    onFinishCallbacks: [],

    finish: () => {
      if (!this.isFinished()) {
        this[_protected].finished = true
        this[_protected].onFinishCallbacks.forEach((callback) => callback())

        this.emit(finish, {
          adUnit: this,
          type: finish
        })
      }
    },

    throwIfCalled: () => {
      throw new Error('VideoAdUnit method must be implemented on child class')
    },

    throwIfFinished: () => {
      if (this.isFinished()) {
        throw new Error('VideoAdUnit is finished')
      }
    }
  }

  /** Ad unit type */
  public type?: string

  /** If an error occurs it will contain the reference to the error otherwise it will be bull */
  public error?: AdUnitError

  /** If an error occurs it will contain the Vast Error code of the error */
  public errorCode?: number

  public vastChain: VastChain
  public videoAdContainer: VideoAdContainer
  public icons?: VastIcon[]
  public pauseOnAdClick: boolean

  /**
   * Creates a {@link VideoAdUnit}.
   *
   * @param vastChain The {@link VastChain} with all the {@link VastResponse}
   * @param videoAdContainer container instance to place the ad
   * @param options Options Map. The allowed properties are:
   */
  public constructor(
    vastChain: VastChain,
    videoAdContainer: VideoAdContainer,
    {
      viewability = false,
      responsive = false,
      logger = console,
      pauseOnAdClick = true
    }: VideoAdUnitOptions = {}
  ) {
    super(logger)

    /** Reference to the {@link VastChain} used to load the ad. */
    this.vastChain = vastChain

    /** Reference to the {@link VideoAdContainer} that contains the ad. */
    this.videoAdContainer = videoAdContainer

    /** Array of {@link VastIcon} definitions to display from the passed {@link VastChain} or undefined if there are no icons.*/
    this.icons = retrieveIcons(vastChain)

    this.pauseOnAdClick = pauseOnAdClick

    this[_protected].onFinishCallbacks.push(
      preventManualProgress(this.videoAdContainer.videoElement)
    )

    this[_private].addIcons()

    const viewableImpression = vastChain.some(({ad}) => ad && getViewable(ad))

    if (viewableImpression) {
      this.once(start, this[_private].setupViewableImpression)
    }

    if (viewability) {
      this.once(start, this[_private].setupViewability)
    }

    if (responsive) {
      this.once(start, this[_private].setupResponsive)
    }
  }

  /*
   * Starts the ad unit.
   *
   * @throws if called twice.
   * @throws if ad unit is finished.
   */
  public start(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public resume(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public pause(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Skips the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public skip(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Sets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @param volume must be a value between 0 and 1;
   */
  public setVolume(_volume: number): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Gets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns the volume of the ad unit.
   */
  public getVolume(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  public cancel(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Returns the duration of the ad Creative or 0 if there is no creative.
   *
   * @returns the duration of the ad unit.
   */
  public duration(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Returns true if the ad is paused and false otherwise
   */
  public paused(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Returns the current time of the ad Creative or 0 if there is no creative.
   *
   * @returns the current time of the ad unit.
   */
  public currentTime(): void {
    this[_protected].throwIfCalled()
  }

  /**
   * Register a callback function that will be called whenever the ad finishes. No matter if it was finished because de ad ended, or cancelled or there was an error playing the ad.
   *
   * @throws if ad unit is finished.
   *
   * @param callback will be called once the ad unit finished
   */
  public onFinish(callback: Listener): void {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function')
    }

    this[_protected].onFinishCallbacks.push(safeCallback(callback, this.logger))
  }

  /**
   * Register a callback function that will be called if there is an error while running the ad.
   *
   * @throws if ad unit is finished.
   *
   * @param callback will be called on ad unit error passing the Error instance  and an object with the adUnit and the  {@link VastChain}.
   */
  public onError(callback: Listener): void {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function')
    }

    this[_protected].onErrorCallbacks.push(safeCallback(callback, this.logger))
  }

  /**
   * @returns true if the ad unit is finished and false otherwise
   */
  public isFinished(): boolean {
    return this[_protected].finished
  }

  /**
   * @returns true if the ad unit has started and false otherwise
   */
  public isStarted(): boolean {
    return this[_protected].started
  }

  /**
   * This method resizes the ad unit to fit the available space in the passed {@link VideoAdContainer}
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns Promise that resolves once the unit was resized
   */
  public async resize(
    width: number,
    height: number,
    mode: string
  ): Promise<void> {
    this[_protected].size = {
      height,
      viewmode: mode,
      width
    }

    if (this.isStarted() && !this.isFinished() && this.icons) {
      await this[_protected].removeIcons?.()
      await this[_protected].drawIcons?.()
    }
  }
}
