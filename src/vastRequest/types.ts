import {pixelTracker} from '../tracker';

/**
 * Options Map
 */
export interface RequestAdOptions {
  /**
   * Sets the maximum number of wrappers allowed in the {@link VastChain}.
   * Defaults to `5`.
   */
  wrapperLimit: number;
  /**
   * Boolean to indicate whether adPods are allowed or not.
   * Defaults to `true`.
   */
  allowMultipleAds: boolean;
  /**
   * Timeout number in milliseconds. If set, the request will timeout if it is not fulfilled before the specified time.
   */
  timeout?: number;
  /**
   * Optional function to track whatever errors occur during the loading.
   * Defaults to `video-ad-tracker` track method.
   */
  tracker: typeof pixelTracker;
}

/**
 * Options Map
 */
export interface RequestNextAdOptions extends RequestAdOptions {
  /**
   * Specifies whether to use buffet ads from an ad pod if possible.
   * If no buffet ad is available it will return the next ad in ad pod sequence.
   * Set it to true if an ad from an adPod failed and you want to replace it with an ad from the ad buffet.
   * Defaults to `false`.
   */
  useAdBuffet: boolean;
  /**
   * Tells the video player to select an ad from any stand-alone ads available.
   * Note: if the {@link VastChain} contains an adPod this property will be ignored.
   * Defaults to `true`.
   */
  fallbackOnNoAd: boolean;
}
