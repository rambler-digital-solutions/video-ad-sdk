import {linearEvents, ErrorCode, isVastErrorCode} from '../tracker'
import {acceptInvitation, adCollapse} from '../tracker/nonLinearEvents'
import {getClickThrough} from '../vastSelectors'
import {VastChain, VpaidCreativeAdUnit} from '../types'
import {VideoAdContainer} from '../adContainer'
import {volumeChanged, adProgress} from './adUnitEvents'
import loadCreative from './helpers/vpaid/loadCreative'
import {
  adLoaded,
  adStarted,
  adStopped,
  adPlaying,
  adPaused,
  startAd,
  stopAd,
  resumeAd,
  pauseAd,
  skipAd,
  setAdVolume,
  getAdVolume,
  getAdDuration,
  resizeAd,
  adSizeChange,
  adError,
  adVideoComplete,
  adSkipped,
  EVENTS,
  adVolumeChange,
  adImpression,
  adVideoStart,
  adVideoFirstQuartile,
  adVideoMidpoint,
  adVideoThirdQuartile,
  adUserAcceptInvitation,
  adUserMinimize,
  adUserClose,
  adDurationChange,
  adRemainingTimeChange,
  adClickThru,
  getAdIcons,
  getAdRemainingTime
} from './helpers/vpaid/api'
import waitFor from './helpers/vpaid/waitFor'
import callAndWait from './helpers/vpaid/callAndWait'
import handshake from './helpers/vpaid/handshake'
import initAd from './helpers/vpaid/initAd'
import AdUnitError from './helpers/adUnitError'
import VideoAdUnit, {_protected, VideoAdUnitOptions} from './VideoAdUnit'

const {
  complete,
  mute,
  unmute,
  skip,
  start,
  firstQuartile,
  pause,
  resume,
  impression,
  midpoint,
  thirdQuartile,
  clickThrough,
  error: errorEvt,
  closeLinear,
  creativeView
} = linearEvents

// NOTE some ads only allow one handler per event and we need to subscribe to the adLoaded to know the creative is loaded.
const VPAID_EVENTS = EVENTS.filter((event) => event !== adLoaded)

const _private = Symbol('_private')

const vpaidGeneralError = (payload: Error | unknown): AdUnitError => {
  const error: AdUnitError =
    payload instanceof Error ? payload : new AdUnitError('VPAID general error')

  if (!error.code || !isVastErrorCode(error.code)) {
    error.code = ErrorCode.VPAID_ERROR
  }

  return error
}

interface Private {
  evtHandler: Record<string, (...args: any[]) => void>
  handleVpaidEvt(event: string, ...args: any[]): void
  handleClickThrough(url: string): void
  getIcons(): void
  drawIcons(): Promise<void>
  muted: boolean
  paused: boolean
  videoStart?: boolean
  loadCreativePromise?: Promise<VpaidCreativeAdUnit>
}

export type VpaidAdUnitOptions = VideoAdUnitOptions

/**
 * @class
 * @alias VpaidAdUnit
 * @extends VideoAdUnit
 * @implements NonLinearEvents
 * @implements LinearEvents
 * @description This class provides everything necessary to run a Vpaid ad.
 */
class VpaidAdUnit extends VideoAdUnit {
  private [_private]: Private = {
    evtHandler: {
      [adClickThru]: (url: string, _id: string, playerHandles: boolean) => {
        if (playerHandles) {
          this[_private].handleClickThrough(url)
        }

        this.emit(clickThrough, {
          adUnit: this,
          type: clickThrough
        })
      },
      [adDurationChange]: () => {
        this.emit(adProgress, {
          adUnit: this,
          type: adProgress
        })
      },
      [adError]: (payload: Error | unknown) => {
        this.error = vpaidGeneralError(payload)
        this.errorCode = this.error.code || null

        this[_protected].onErrorCallbacks.forEach((callback) =>
          callback(this.error, {
            adUnit: this,
            vastChain: this.vastChain
          })
        )

        this[_protected].finish()

        this.emit(errorEvt, {
          adUnit: this,
          type: errorEvt
        })
      },
      [adImpression]: () => {
        // NOTE: some ads forget to trigger the adVideoStart event. :(
        if (!this[_private].videoStart) {
          this[_private].handleVpaidEvt(adVideoStart)
        }

        this.emit(impression, {
          adUnit: this,
          type: impression
        })
      },
      [adPaused]: () => {
        this[_private].paused = true
        this.emit(pause, {
          adUnit: this,
          type: pause
        })
      },
      [adPlaying]: () => {
        this[_private].paused = false
        this.emit(resume, {
          adUnit: this,
          type: resume
        })
      },
      [adRemainingTimeChange]: () => {
        this.emit(adProgress, {
          adUnit: this,
          type: adProgress
        })
      },
      [adSkipped]: () => {
        this.cancel()
        this.emit(skip, {
          adUnit: this,
          type: skip
        })
      },
      [adStarted]: () => {
        this.emit(creativeView, {
          adUnit: this,
          type: creativeView
        })
      },
      [adStopped]: () => {
        this.emit(adStopped, {
          adUnit: this,
          type: adStopped
        })

        this[_protected].finish()
      },
      [adUserAcceptInvitation]: () => {
        this.emit(acceptInvitation, {
          adUnit: this,
          type: acceptInvitation
        })
      },
      [adUserClose]: () => {
        this.emit(closeLinear, {
          adUnit: this,
          type: closeLinear
        })

        this[_protected].finish()
      },
      [adUserMinimize]: () => {
        this.emit(adCollapse, {
          adUnit: this,
          type: adCollapse
        })
      },
      [adVideoComplete]: () => {
        this.emit(complete, {
          adUnit: this,
          type: complete
        })
      },
      [adVideoFirstQuartile]: () => {
        this.emit(firstQuartile, {
          adUnit: this,
          type: firstQuartile
        })
      },
      [adVideoMidpoint]: () => {
        this.emit(midpoint, {
          adUnit: this,
          type: midpoint
        })
      },
      [adVideoStart]: () => {
        if (!this[_private].videoStart) {
          this[_private].videoStart = true
          this[_private].paused = false
          this.emit(start, {
            adUnit: this,
            type: start
          })
        }
      },
      [adVideoThirdQuartile]: () => {
        this.emit(thirdQuartile, {
          adUnit: this,
          type: thirdQuartile
        })
      },
      [adVolumeChange]: () => {
        const volume = this.getVolume()

        this.emit(volumeChanged, {
          adUnit: this,
          type: volumeChanged
        })

        if (volume === 0 && !this[_private].muted) {
          this[_private].muted = true
          this.emit(mute, {
            adUnit: this,
            type: mute
          })
        }

        if (volume > 0 && this[_private].muted) {
          this[_private].muted = false
          this.emit(unmute, {
            adUnit: this,
            type: unmute
          })
        }
      }
    },
    handleVpaidEvt: (event, ...args) => {
      const handler = this[_private].evtHandler[event]

      if (handler) {
        handler(...args)
      }

      this.emit(event, {
        adUnit: this,
        type: event
      })
    },
    handleClickThrough: (url) => {
      if (this.paused() && this.pauseOnAdClick) {
        this.resume()

        return
      }

      const inlineAd = this.vastChain[0].ad
      const clickThroughUrl =
        typeof url === 'string' && url.length > 0
          ? url
          : inlineAd && getClickThrough(inlineAd)

      if (this.pauseOnAdClick) {
        this.pause()
      }

      if (clickThroughUrl) {
        window.open(clickThroughUrl, '_blank')
      }
    },
    getIcons: (): void => {
      if (this.creativeAd?.[getAdIcons]) {
        try {
          if (!this.creativeAd[getAdIcons]()) {
            this.icons = null
          }
        } catch (error) {
          this.icons = null
        }
      }
    },
    drawIcons: async (): Promise<void> => {
      if (this.isFinished()) {
        return
      }

      await this[_protected].drawIcons?.()

      if (
        this[_protected].hasPendingIconRedraws?.() &&
        !this.isFinished()
      ) {
        setTimeout(this[_private].drawIcons, 500)
      }
    },
    muted: false,
    paused: true
  }

  /** Ad unit type. Will be `VPAID` for VpaidAdUnit */
  public type = 'VPAID'

  /** Reference to the Vpaid Creative ad unit. Will be null before the ad unit starts. */
  public creativeAd: VpaidCreativeAdUnit | null = null

  /**
   * Creates a {VpaidAdUnit}.
   *
   * @param vastChain The {@link VastChain} with all the {@link VastResponse}
   * @param videoAdContainer container instance to place the ad
   * @param options Options Map
   */
  constructor(
    vastChain: VastChain,
    videoAdContainer: VideoAdContainer,
    options: VpaidAdUnitOptions = {}
  ) {
    super(vastChain, videoAdContainer, options)

    this[_private].loadCreativePromise = loadCreative(
      vastChain,
      videoAdContainer
    )
  }

  /**
   * Starts the ad unit.
   *
   * @throws if called twice.
   * @throws if ad unit is finished.
   */
  public async start(): Promise<void> {
    this[_protected].throwIfFinished()

    if (this.isStarted()) {
      throw new Error('VpaidAdUnit already started')
    }

    try {
      this.creativeAd = (await this[_private]
        .loadCreativePromise) as VpaidCreativeAdUnit

      const adLoadedPromise = waitFor(this.creativeAd, adLoaded)

      for (const creativeEvt of VPAID_EVENTS) {
        this.creativeAd.subscribe(
          this[_private].handleVpaidEvt.bind(this, creativeEvt),
          creativeEvt
        )
      }

      this[_private].getIcons()

      handshake(this.creativeAd, '2.0')
      initAd(this.creativeAd, this.videoAdContainer, this.vastChain)

      await adLoadedPromise

      // if the ad timed out while trying to load the videoAdContainer will be destroyed
      if (!this.videoAdContainer.isDestroyed()) {
        try {
          const {videoElement} = this.videoAdContainer

          if (videoElement.muted) {
            this[_private].muted = true
            this.setVolume(0)
          } else {
            this.setVolume(videoElement.volume)
          }

          await callAndWait(this.creativeAd, startAd, adStarted)

          if (this.icons) {
            await this[_private].drawIcons()
          }

          this[_protected].started = true
        } catch (error) {
          this.cancel()
        }
      }
    } catch (error) {
      this[_private].handleVpaidEvt(adError, error)
      throw error
    }
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public resume(): void {
    this.creativeAd?.[resumeAd]()
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public pause(): void {
    this.creativeAd?.[pauseAd]()
  }

  /**
   * Skip the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public skip(): void {
    this.creativeAd?.[skipAd]()
  }

  /**
   * Returns true if the ad is paused and false otherwise
   */
  public paused(): boolean {
    return this.isFinished() || this[_private].paused
  }

  /**
   * Sets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @param volume must be a value between 0 and 1;
   */
  public setVolume(volume: number): void {
    this.creativeAd?.[setAdVolume](volume)
  }

  /**
   * Gets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns the volume of the ad unit.
   */
  public getVolume(): number {
    if (!this.creativeAd) {
      return 0
    }

    return this.creativeAd[getAdVolume]()
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  public async cancel(): Promise<void> {
    this[_protected].throwIfFinished()

    try {
      const adStoppedPromise =
        this.creativeAd && waitFor(this.creativeAd, adStopped, 3000)

      this.creativeAd?.[stopAd]()
      await adStoppedPromise
    } catch (error) {
      this[_protected].finish()
    }
  }

  /**
   * Returns the duration of the ad Creative or 0 if there is no creative.
   *
   * Note: if the user has engaged with the ad, the duration becomes unknown and it will return 0;
   *
   * @returns the duration of the ad unit.
   */
  public duration(): number {
    if (!this.creativeAd) {
      return 0
    }

    const duration = this.creativeAd[getAdDuration]()

    if (duration < 0) {
      return 0
    }

    return duration
  }

  /**
   * Returns the current time of the ad Creative or 0 if there is no creative.
   *
   * Note: if the user has engaged with the ad, the currentTime becomes unknown and it will return 0;
   *
   * @returns the current time of the ad unit.
   */
  public currentTime(): number {
    if (!this.creativeAd) {
      return 0
    }

    const remainingTime = this.creativeAd[getAdRemainingTime]()

    if (remainingTime < 0) {
      return 0
    }

    return this.duration() - remainingTime
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
    viewmode: string
  ): Promise<void> {
    await super.resize(width, height, viewmode)

    if (!this.creativeAd) {
      return
    }

    if (this.isStarted() && !this.isFinished()) {
      const slot = this.videoAdContainer.slotElement

      if (slot) {
        slot.style.height = `${height}px`
        slot.style.width = `${width}px`
      }
    }

    return callAndWait(
      this.creativeAd,
      resizeAd,
      adSizeChange,
      width,
      height,
      viewmode
    )
  }
}

export default VpaidAdUnit
