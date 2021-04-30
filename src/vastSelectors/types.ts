import {ParsedXML} from '../xml';

/**
 * JS XML deserialised object.
 */
export type ParsedVast = ParsedXML;

/**
 * Deserialised ad object from a {@link ParsedVast} object.
 */
export type ParsedAd = ParsedXML;

/**
 * An Object representing a processed VAST response.
 */
export interface VastResponse {
  /**
   * The selected ad extracted from the passed XML.
   */
  ad: ParsedAd | null;
  /**
   * The XML parsed object.
   */
  parsedXML: ParsedVast | null;
  /**
   * VAST error code number to identify the error or null if there is no error.
   */
  errorCode: number | null;
  /**
   * Error instance with a human readable description of the error or undefined if there is no error.
   */
  error?: Error;
  /**
   * Ad tag that was used to get this `VastResponse`.
   */
  requestTag: string;
  /**
   * RAW XML as it came from the server.
   */
  XML: string | null;
}

/**
 * Array of {@link VastResponse} sorted backwards. Last response goes first.
 * Represents the chain of VAST responses that ended up on a playable video ad or an error.
 */
export type VastChain = VastResponse[];

/**
 * The parsed time offset in milliseconds or a string with the percentage
 */
export type ParsedOffset = number | string;

/**
 * VastIcon.
 * For more info please take a look at the [VAST specification]{@link https://iabtechlab.com/standards/vast/}
 */
export interface VastIcon {
  /**
   * The time of delay from when the associated linear creative begins playing to when the icon should be displayed.
   */
  offset?: ParsedOffset | null;
  /**
   * The duration the icon should be displayed unless ad is finished playing.
   */
  duration?: ParsedOffset | null;
  /**
   * Pixel height of the icon.
   */
  height?: number | null;
  /**
   * Pixel width of the icon.
   */
  width?: number | null;
  /**
   * The program represented in the icon (e.g. "AdChoices").
   */
  program?: string | null;
  /**
   * The pixel ratio for which the icon creative is intended.
   * The pixel ratio is the ratio of physical pixels on the device to the device-independent pixels.
   * An ad intended for display on a device with a pixel ratio that is twice that of a standard 1:1 pixel ratio would use the value "2."
   * Default value is "1.".
   */
  pxratio?: number | null;
  /**
   * The x-coordinate of the top, left corner of the icon asset relative to the ad display area.
   * Values of "left" or "right" also accepted and indicate the leftmost or rightmost available position for the icon asset.
   */
  xPosition?: string | number | null;
  /**
   * The y-coordinate of the top left corner of the icon asset relative to the ad display area.
   * Values of "top" or "bottom" also accepted and indicate the topmost or bottom most available position for the icon asset
   */
  yPosition?: string | number | null;
  /**
   * The URI to a static creative file to be used as the icon.
   */
  staticResource?: string | null;
  /**
   * The URI to a static creative file to be used as the icon.
   */
  htmlResource?: string | null;
  /**
   * The URI to a static creative file to be used as the icon.
   */
  iFrameResource?: string | null;
  /**
   * Array of URIs for the tracking resource files to be called when the icon creative is displayed
   */
  iconViewTracking?: string[] | null;
  /**
   * A URI to the industry program page opened when a viewer clicks the icon.
   */
  iconClickThrough?: string | null;
  /**
   * Array of URIs to the tracking resource files to be called when a click corresponding to the id attribute (if provided) occurs.
   */
  iconClickTracking?: string[] | null;
  /**
   * @internal
   */
  signature?: string
}

/**
 * From [VAST specification]{@link https://iabtechlab.com/standards/vast/}:
 *
 * Sometimes ad servers would like to collect metadata from the video player when tracking
 * event URIs are accessed. For example, the position of the video player playhead at the time
 * a tracking event URI is accessed is useful to the ad server and is data that can only be
 * known at the time of the prescribed tracking event. This data cannot be built into the URI at
 * the time the VAST response is built and served.
 *
 * The following macros enable the video player to provide certain details to the ad server at
 * the time tracking URIs are accessed.
 *  * *[ERRORCODE]*: replaced with one of the error codes listed in section 2.3.6.3 when the
 * associated error occurs; reserved for error tracking URIs.
 *  * *[CONTENTPLAYHEAD]*: replaced with the current time offset “HH:MM:SS.mmm” of the
 * video content.
 *  * *[CACHEBUSTING]*: replaced with a random 8-digit number.
 *  * *[ASSETURI]*: replaced with the URI of the ad asset being played.
 *  * *[TIMESTAMP]*: the date and time at which the URI using this macro is accessed.
 * Used where ever a time stamp is needed, the macro is replaced with the date and
 * time using the formatting conventions of ISO 8601. However, ISO 8601 does not
 * provide a convention for adding milliseconds. To add milliseconds, use the
 * convention .mmm at the end of the time provided and before any time zone
 * indicator. For example, January 17, 2016 at 8:15:07 and 127 milliseconds, Eastern
 * Time would be formatted as follows: 2016-01-17T8:15:07.127-05
 * When replacing macros, the video player must correctly percent-encode any characters as
 * defined by RFC 3986.
 * VAST doesn’t provide any guidance on URI format, but using the [CACHEBUSTING] macro
 * simplifies trafficking, enabling ad servers to easily search and replace the appropriate
 * macro for cache busting.
 */
export type VastMacro = string;

/**
 * VAST InteractiveFile representation
 * For more info please take a look at the [VAST specification]{@link https://iabtechlab.com/standards/vast/}
 */
export interface InteractiveFile {
  /**
   * Will most likely be `VPAID`
   */
  apiFramework?: string | null;
  /**
   * The source file url.
   */
  src?: string | null;
  /**
   * MIME type for the file container like `application/javascript`.
   */
  type?: string | null;
}

/**
 * VAST MediaFile representation.
 * For more info please take a look at the [VAST specification]{@link https://iabtechlab.com/standards/vast/}
 */
export interface MediaFile extends InteractiveFile {
  /**
   * The codec used to encode the file which can take values as specified by [RFC 4281]{@link http://tools.ietf.org/html/rfc4281}.
   */
  codec?: string | null;
  /**
   * Either `progressive` for progressive download protocols (such as HTTP) or `streaming` for streaming protocols.
   */
  delivery?: string | null;
  /**
   * The native height of the video file, in pixels.
   */
  height?: string | null;
  /**
   * An identifier for the media file.
   */
  id?: string | null;
  /**
   * Boolean value that indicates whether aspect ratio for media file dimensions
   * should be maintained when scaled to new dimensions
   */
  maintainAspectRatio?: string | null;
  /**
   * For progressive load video, the bitrate value specifies the average bitrate for the media file
   */
  bitrate?: string | null;
  /**
   * Max bitrate for streaming videos.
   */
  maxBitrate?: string | null;
  /**
   * Min bitrate for streaming videos.
   */
  minBitrate?: string | null;
  /**
   * Boolean value that indicates whether the media file is meant to scale to larger dimensions
   */
  scalable?: string | null;
  /**
   * MIME type for the file container. Popular MIME types include,
   * but are not limited to “video/x-flv” for Flash Video and “video/mp4” for MP4.
   */
  type?: string | null;
  /**
   * The native width of the video file, in pixels.
   */
  width?: string | null;
  /**
   * A string identifying the unique creative identifier.
   */
  universalAdId?: string | null;
}

/**
 * For more info please take a look at the [VAST specification]{@link https://iabtechlab.com/standards/vast/}
 */
export interface VastTrackingEvent {
  /**
   * A string that defines the event being track.
   */
  event?: string | null;
  /**
   * When the progress of the linear creative has matched the value specified, the included URI is triggered
   */
  offset?: ParsedOffset | null;
  /**
   * A URI to the tracking resource for the event specified using the event attribute
   */
  uri?: string | null;
}

/**
 * Wrapper ad options.
 */
export interface WrapperOptions {
  /**
   * a Boolean value that identifies whether multiple ads are allowed in the
   * requested VAST response. If true, both Pods and stand-alone ads are
   * allowed. If false, only the first stand-alone Ad (with no sequence values)
   * in the requested VAST response is allowed. Default value is “false.”
   */
  allowMultipleAds?: boolean;
  /**
   * a Boolean value that provides instruction for using an available Ad when
   * the requested VAST response returns no ads. If true, the video player
   * should select from any stand-alone ads available. If false and the Wrapper
   * represents an Ad in a Pod, the video player should move on to the next Ad
   * in a Pod; otherwise, the video player can follow through at its own
   * discretion where no-ad responses are concerned.
   */
  fallbackOnNoAd?: boolean;
  /**
   * a Boolean value that identifies whether subsequent wrappers after a
   * requested VAST response is allowed. If false, any Wrappers received (i.e.
   * not an Inline VAST response) should be ignored. Otherwise, VAST
   * Wrappers received should be accepted (default value is “true.”)
   */
  followAdditionalWrappers?: boolean;
}

/**
 * Object with the trafficking ad parameters and the xmlEncoded flag.
 */
export interface CreativeData {
  /**
   * the AdParameters of the linear Ad as they come in the VAST XML.
   */
  AdParameters?: string | null;
  /**
   * true if the AdParameters are xml encoded and false otherwise
   */
  xmlEncoded?: boolean | null;
}

/**
 * {@link VastChain} details object. You can think of it as a summary of the VAST Chain. Useful for debugging purposes and tracking.
 * for more info about the returned properties please check [VAST specification]{@link https://iabtechlab.com/standards/vast/}
 */
export interface VastChainDetails {
  /**
   * the ad Id. See VAST spec for more info
   */
  adId?: string;
  /**
   * the adServingId See VAST spec for more info
   */
  adServingId?: string;
  /**
   * the ad system. See VAST spec for more info
   */
  adSystem?: string;
  /**
   * ad title.
   */
  adTitle?: string;
  /**
   * ad advertiser's name.
   */
  advertiser?: string;
  /**
   * creative ad ids of the wrapper.
   */
  adWrapperCreativeAdIds?: string[];
  /**
   * creative Ids of the wrappers.
   */
  adWrapperCreativeIds?: string[];
  /**
   * ad ids of the wrappers.
   */
  adWrapperIds?: string;
  /**
   * ad systems of the wrappers.
   */
  adWrapperSystems?: string;
  /**
   * ad category.
   */
  category?: string;
  /**
   * ad category authority.
   */
  categoryAuthority?: string;
  /**
   * the inline ad clickThroughUr.
   */
  clickThroughUrl?: string;
  /**
   * [creativeAdId] - the ad id of the linear creative.
   */
  creativeAdId?: string;
  /**
   * Object with the {@link creativeData} of the Ad.
   */
  creativeData?: string;
  /**
   * the id of the linear creative.
   */
  creativeId?: string;
  /**
   * ad description.
   */
  description?: string;
  /**
   * the linear duration as it comes int the VAST XML
   */
  duration?: string;
  /**
   * the linear duration in milliseconds
   */
  durationInMs?: number;
  /**
   * The linear ads {@link MediaFile}s
   */
  mediaFiles?: MediaFile[];
  /**
   * the pricing of the ad if available
   */
  pricing?: string;
  /**
   * the currency of the pricing if available.
   */
  pricingCurrency?: string;
  /**
   * the pricing model if available.
   */
  pricingModel?: string;
  /**
   * the linear skip offset as it comes int the VAST XML
   */
  skipOffset?: string;
  /**
   * the linear skip offset in milliseconds
   */
  skipOffsetInMs?: number;
  /**
   * true if the ad is skippable and false otherwise.
   */
  skippable?: boolean;
  /**
   * Universal Ad Id of the ad.
   */
  universalAdId?: string;
  /**
   * registry of the Universal Ad Id of the ad.
   */
  universalAdIdRegistry?: string;
  /**
   * VAST version of the last {@link VastResponse}. If no version is found it will contain `unknown`.
   */
  vastVersion?: string;
  /**
   * if the VastChain has a linear ad, it will be true if it contains a VPAID creative and false otherwise.
   */
  vpaid?: boolean;
}
