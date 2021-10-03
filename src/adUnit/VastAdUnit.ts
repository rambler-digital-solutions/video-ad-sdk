import {linearEvents} from '../tracker';
import {getSkipOffset} from '../vastSelectors';
import {VastChain, Hooks, MacroData} from '../types'
import {VideoAdContainer} from '../adContainer'
import findBestMedia from './helpers/media/findBestMedia';
import once from './helpers/dom/once';
import setupMetricHandlers from './helpers/metrics/setupMetricHandlers';
import updateMedia from './helpers/media/updateMedia';
import AdUnitError from './helpers/adUnitError'
import VideoAdUnit, {_protected, VideoAdUnitOptions} from './VideoAdUnit';

const {complete, error: errorEvt, skip} = linearEvents;

// eslint-disable-next-line id-match
const _private = Symbol('_private');

interface Private {
  handleMetric(event: string, data?: MacroData | AdUnitError): void
}

export interface VastAdUnitOptions extends VideoAdUnitOptions {
  /**
   * Optional map with hooks to configure the behaviour of the ad.
   */
  hooks?: Hooks
}

/**
 * This class provides everything necessary to run a Vast ad.
 */
class VastAdUnit extends VideoAdUnit {
  private [_private]: Private = {
    handleMetric: (event, data) => {
      switch (event) {
      case complete: {
        this[_protected].finish();
        break;
      }
      case errorEvt: {
        if (data instanceof Error) {
          this.error = data;
          this.errorCode = this.error.code || 405;
        }
        this[_protected].onErrorCallbacks.forEach((callback) =>
          callback(this.error, {
            adUnit: this,
            vastChain: this.vastChain
          })
        );
        this[_protected].finish();
        break;
      }
      case skip: {
        this.cancel();
        break;
      }
      }

      this.emit(event, {
        adUnit: this,
        data,
        type: event
      });
    }
  };

  public assetUri: string | null = null;

  /** Ad unit type. Will be `VAST` for VastAdUnit */
  public type = 'VAST';

  private hooks: Hooks

  /**
   * Creates a {VastAdUnit}.
   *
   * @param vastChain The {@link VastChain} with all the {@link VastResponse}
   * @param videoAdContainer - container instance to place the ad
   * @param Options Map
   */
  public constructor (vastChain: VastChain, videoAdContainer: VideoAdContainer, options: VastAdUnitOptions = {}) {
    super(vastChain, videoAdContainer, options);

    const {onFinishCallbacks} = this[_protected];
    const {handleMetric} = this[_private];

    this.hooks = options.hooks || {};

    const removeMetricHandlers = setupMetricHandlers(
      {
        hooks: this.hooks,
        vastChain: this.vastChain,
        videoAdContainer: this.videoAdContainer
      },
      handleMetric
    );

    onFinishCallbacks.push(removeMetricHandlers);
  }

  /**
   * Starts the ad unit.
   *
   * @throws if called twice.
   * @throws if ad unit is finished.
   */
  public async start (): Promise<void> {
    this[_protected].throwIfFinished();

    if (this.isStarted()) {
      throw new AdUnitError('VastAdUnit already started');
    }

    const inlineAd = this.vastChain[0].ad;
    const {videoElement, element} = this.videoAdContainer;
    const media = inlineAd && findBestMedia(inlineAd, videoElement, element, this.hooks);

    if (Boolean(media)) {
      if (this.icons) {
        const drawIcons = async (): Promise<void> => {
          if (this.isFinished()) {
            return;
          }

          await this[_protected].drawIcons?.();

          if (this[_protected].hasPendingIconRedraws?.() && !this.isFinished()) {
            once(videoElement, 'timeupdate', drawIcons);
          }
        };

        await drawIcons();
      }

      if (media?.src) {
        videoElement.src = media.src;
        this.assetUri = media.src;
      }

      videoElement.play();
    } else {
      const adUnitError = new AdUnitError('Can\'t find a suitable media to play');

      adUnitError.code = 403;
      this[_private].handleMetric(errorEvt, adUnitError);
    }

    this[_protected].started = true;
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public resume (): void {
    this.videoAdContainer.videoElement.play();
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public pause (): void {
    this.videoAdContainer.videoElement.pause();
  }

  /**
   * Skips the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  public skip (): void {
    const inlineAd = this.vastChain[0].ad;
    const skipoffset = inlineAd && getSkipOffset(inlineAd);
    const currentTimeMs = this.currentTime() * 1000;

    if (skipoffset && currentTimeMs >= skipoffset) {
      this[_private].handleMetric(skip);
    }
  }

  /**
   * Returns true if the ad is paused and false otherwise
   */
  public paused (): boolean {
    return this.videoAdContainer.videoElement.paused;
  }

  /**
   * Sets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @param volume must be a value between 0 and 1;
   */
  public setVolume (volume: number): void {
    this.videoAdContainer.videoElement.volume = volume;
  }

  /**
   * Gets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns the volume of the ad unit.
   */
  public getVolume (): number {
    return this.videoAdContainer.videoElement.volume;
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  public cancel (): void {
    this[_protected].throwIfFinished();

    this.videoAdContainer.videoElement.pause();

    this[_protected].finish();
  }

  /**
   * Returns the duration of the ad Creative or 0 if there is no creative.
   *
   * @returns the duration of the ad unit.
   */
  public duration (): number {
    if (!this.isStarted()) {
      return 0;
    }

    return this.videoAdContainer.videoElement.duration;
  }

  /**
   * Returns the current time of the ad Creative or 0 if there is no creative.
   *
   * @returns the current time of the ad unit.
   */
  public currentTime (): number {
    if (!this.isStarted()) {
      return 0;
    }

    return this.videoAdContainer.videoElement.currentTime;
  }

  /**
   * This method resizes the ad unit to fit the available space in the passed {@link VideoAdContainer}
   *
   * @param width the new width of the ad container.
   * @param height the new height of the ad container.
   * @param viewmode fullscreen | normal | thumbnail
   * @returns Promise that resolves once the unit was resized
   */
  public async resize (width: number, height: number, viewmode: string): Promise<void> {
    await super.resize(width, height, viewmode);

    if (this.isStarted() && !this.isFinished()) {
      const inlineAd = this.vastChain[0].ad;
      const {videoElement, element} = this.videoAdContainer;
      const media = inlineAd && findBestMedia(inlineAd, videoElement, element, this.hooks);

      if (media && videoElement.src !== media.src) {
        updateMedia(videoElement, media);
      }
    }
  }
}

export default VastAdUnit;
