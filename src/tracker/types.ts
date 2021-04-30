import {VastMacro} from '../vastSelectors';

/**
 * Data Object with the macros's variables.
 */
export type MacroData = Record<string, any>;

/**
 * Creates a tracking image with the passed URL macro.
 *
 * @param urlMacro URL Macro that need to be tracked.
 * @param data Data Object with the macros's variables.
 * @returns Image element whose source is the parsed URL Macro.
 */
export type PixelTracker = (
  urlMacro: VastMacro,
  data: MacroData
) => HTMLImageElement;

export interface VastEventTrackerOptions {
  /**
   * Data Object with the macros's variables.
   */
  data?: MacroData;
  /**
   * Error code. Needed if we are tracking an error.
   */
  errorCode?: string;
  /**
   * Optional tracker to use for the actual tracking. Defaults to the pixel tracker.
   */
  tracker?: PixelTracker;
  /**
   * Optional logger instance.
   * Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   * Defaults to console.
   */
  logger?: Console;
}
