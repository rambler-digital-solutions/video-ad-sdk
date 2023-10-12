/**
 * XML node type
 */
export enum NodeType {
  CDATA = 'cdata',
  DOCUMENT = 'document',
  ELEMENT = 'element',
  TEXT = 'text'
}

/**
 * XML attribute map
 */
export type Attributes = Partial<Record<string, string>>

/**
 * JS XML deserialised object.
 */
export interface ParsedXML {
  type: NodeType
  name?: string
  text?: string
  elements?: ParsedXML[]
  attributes?: Attributes
}

/**
 * Deserialised ad object from a {@link ParsedXML} object.
 */
export type ParsedAd = ParsedXML

/**
 * An Object representing a processed VAST response.
 */
export interface VastResponse {
  /**
   * The selected ad extracted from the passed XML.
   */
  ad?: ParsedAd
  /**
   * The XML parsed object.
   */
  parsedXML?: ParsedXML
  /**
   * VAST error code number to identify the error.
   */
  errorCode?: number
  /**
   * Error instance with a human readable description of the error or undefined if there is no error.
   */
  error?: Error
  /**
   * Ad tag that was used to get this `VastResponse`.
   */
  requestTag: string
  /**
   * RAW XML as it came from the server.
   */
  XML?: string
  /**
   * RAW response object.
   */
  response?: Response
}

/**
 * Array of {@link VastResponse} sorted backwards. Last response goes first.
 * Represents the chain of VAST responses that ended up on a playable video ad or an error.
 */
export type VastChain = VastResponse[]

/**
 * The parsed time offset in milliseconds or a string with the percentage
 */
export type ParsedOffset = number | string

/**
 * VastIcon.
 * For more info please take a look at the [VAST specification](https://iabtechlab.com/standards/vast/)
 */
export interface VastIcon {
  /**
   * The time of delay from when the associated linear creative begins playing to when the icon should be displayed.
   */
  offset?: number
  /**
   * The duration the icon should be displayed unless ad is finished playing.
   */
  duration?: number
  /**
   * Pixel height of the icon.
   */
  height?: number
  /**
   * Pixel width of the icon.
   */
  width?: number
  /**
   * Pixel top offset of the icon.
   */
  top?: number
  /**
   * Pixel left offset of the icon.
   */
  left?: number
  /**
   * The program represented in the icon (e.g. "AdChoices").
   */
  program?: string
  /**
   * The pixel ratio for which the icon creative is intended.
   * The pixel ratio is the ratio of physical pixels on the device to the device-independent pixels.
   * An ad intended for display on a device with a pixel ratio that is twice that of a standard 1:1 pixel ratio would use the value "2."
   * Default value is "1.".
   */
  pxratio?: number
  /**
   * The x-coordinate of the top, left corner of the icon asset relative to the ad display area.
   * Values of "left" or "right" also accepted and indicate the leftmost or rightmost available position for the icon asset.
   */
  xPosition?: string | number
  /**
   * The y-coordinate of the top left corner of the icon asset relative to the ad display area.
   * Values of "top" or "bottom" also accepted and indicate the topmost or bottom most available position for the icon asset
   */
  yPosition?: string | number
  /**
   * The URI to a static creative file to be used as the icon.
   */
  staticResource?: string
  /**
   * The URI to a static creative file to be used as the icon.
   */
  htmlResource?: string
  /**
   * The URI to a static creative file to be used as the icon.
   */
  iFrameResource?: string
  /**
   * Array of URIs for the tracking resource files to be called when the icon creative is displayed
   */
  iconViewTracking?: string[]
  /**
   * A URI to the industry program page opened when a viewer clicks the icon.
   */
  iconClickThrough?: string
  /**
   * Array of URIs to the tracking resource files to be called when a click corresponding to the id attribute (if provided) occurs.
   */
  iconClickTracking?: string[]
  /**
   * @internal
   */
  signature?: string
  /**
   * @internal
   */
  element?: HTMLAnchorElement
}

export interface RenderedVastIcon extends VastIcon {
  height: number
  left: number
  top: number
  width: number
  signature: string
  updated: boolean
}

/**
 * From [VAST specification](https://iabtechlab.com/standards/vast/):
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
export type VastMacro = string // eslint-disable-line sonar/redundant-type-aliases

/**
 * VAST InteractiveFile representation
 * For more info please take a look at the [VAST specification](https://iabtechlab.com/standards/vast/)
 */
export interface InteractiveFile {
  /**
   * Will most likely be `VPAID`
   */
  apiFramework?: string
  /**
   * The source file url.
   */
  src?: string
  /**
   * MIME type for the file container like `application/javascript`.
   */
  type?: string
}

/**
 * VAST MediaFile representation.
 * For more info please take a look at the [VAST specification](https://iabtechlab.com/standards/vast/)
 */
export interface MediaFile extends InteractiveFile {
  /**
   * The codec used to encode the file which can take values as specified by [RFC 4281](http://tools.ietf.org/html/rfc4281).
   */
  codec?: string
  /**
   * Either `progressive` for progressive download protocols (such as HTTP) or `streaming` for streaming protocols.
   */
  delivery?: string
  /**
   * The native height of the video file, in pixels.
   */
  height?: string
  /**
   * An identifier for the media file.
   */
  id?: string
  /**
   * Boolean value that indicates whether aspect ratio for media file dimensions
   * should be maintained when scaled to new dimensions
   */
  maintainAspectRatio?: string
  /**
   * For progressive load video, the bitrate value specifies the average bitrate for the media file
   */
  bitrate?: string
  /**
   * Max bitrate for streaming videos.
   */
  maxBitrate?: string
  /**
   * Min bitrate for streaming videos.
   */
  minBitrate?: string
  /**
   * Boolean value that indicates whether the media file is meant to scale to larger dimensions
   */
  scalable?: string
  /**
   * MIME type for the file container. Popular MIME types include,
   * but are not limited to “video/x-flv” for Flash Video and “video/mp4” for MP4.
   */
  type?: string
  /**
   * The native width of the video file, in pixels.
   */
  width?: string
  /**
   * A string identifying the unique creative identifier.
   */
  universalAdId?: string
}

/**
 * For more info please take a look at the [VAST specification](https://iabtechlab.com/standards/vast/)
 */
export interface VastTrackingEvent {
  /**
   * A string that defines the event being track.
   */
  event?: string
  /**
   * When the progress of the linear creative has matched the value specified, the included URI is triggered
   */
  offset?: ParsedOffset
  /**
   * A URI to the tracking resource for the event specified using the event attribute
   */
  uri?: string
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
  allowMultipleAds?: boolean
  /**
   * a Boolean value that provides instruction for using an available Ad when
   * the requested VAST response returns no ads. If true, the video player
   * should select from any stand-alone ads available. If false and the Wrapper
   * represents an Ad in a Pod, the video player should move on to the next Ad
   * in a Pod; otherwise, the video player can follow through at its own
   * discretion where no-ad responses are concerned.
   */
  fallbackOnNoAd?: boolean
  /**
   * a Boolean value that identifies whether subsequent wrappers after a
   * requested VAST response is allowed. If false, any Wrappers received (i.e.
   * not an Inline VAST response) should be ignored. Otherwise, VAST
   * Wrappers received should be accepted (default value is “true.”)
   */
  followAdditionalWrappers?: boolean
}

/**
 * Object with the trafficking ad parameters and the xmlEncoded flag.
 */
export interface VpaidCreativeData {
  /**
   * the AdParameters of the linear Ad as they come in the VAST XML.
   */
  AdParameters?: string
  /**
   * true if the AdParameters are xml encoded and false otherwise
   */
  xmlEncoded?: boolean
}

/**
 * {@link VastChain} details object. You can think of it as a summary of the VAST Chain. Useful for debugging purposes and tracking.
 * for more info about the returned properties please check [VAST specification](https://iabtechlab.com/standards/vast/)
 */
export interface VastChainDetails {
  /**
   * the ad Id. See VAST spec for more info
   */
  adId?: string
  /**
   * the adServingId See VAST spec for more info
   */
  adServingId?: string
  /**
   * the ad system. See VAST spec for more info
   */
  adSystem?: string
  /**
   * ad title.
   */
  adTitle?: string
  /**
   * ad advertiser's name.
   */
  advertiser?: string
  /**
   * creative ad ids of the wrapper.
   */
  adWrapperCreativeAdIds?: string[]
  /**
   * creative Ids of the wrappers.
   */
  adWrapperCreativeIds?: string[]
  /**
   * ad ids of the wrappers.
   */
  adWrapperIds?: string[]
  /**
   * ad systems of the wrappers.
   */
  adWrapperSystems?: string[]
  /**
   * ad category.
   */
  category?: string
  /**
   * ad category authority.
   */
  categoryAuthority?: string
  /**
   * the inline ad clickThroughUr.
   */
  clickThroughUrl?: string
  /**
   * [creativeAdId] - the ad id of the linear creative.
   */
  creativeAdId?: string
  /**
   * Object with the {@link VpaidCreativeData} of the Ad.
   */
  creativeData?: VpaidCreativeData
  /**
   * the id of the linear creative.
   */
  creativeId?: string
  /**
   * ad description.
   */
  description?: string
  /**
   * the linear duration as it comes int the VAST XML
   */
  duration?: string
  /**
   * the linear duration in milliseconds
   */
  durationInMs?: number
  /**
   * The linear ads {@link MediaFile}s
   */
  mediaFiles?: MediaFile[]
  /**
   * the pricing of the ad if available
   */
  pricing?: string
  /**
   * the currency of the pricing if available.
   */
  pricingCurrency?: string
  /**
   * the pricing model if available.
   */
  pricingModel?: string
  /**
   * the linear skip offset as it comes int the VAST XML
   */
  skipOffset?: string
  /**
   * the linear skip offset in milliseconds
   */
  skipOffsetInMs?: number
  /**
   * true if the ad is skippable and false otherwise.
   */
  skippable?: boolean
  /**
   * Universal Ad Id of the ad.
   */
  universalAdId?: string
  /**
   * registry of the Universal Ad Id of the ad.
   */
  universalAdIdRegistry?: string
  /**
   * VAST version of the last {@link VastResponse}. If no version is found it will contain `unknown`.
   */
  vastVersion?: string
  /**
   * if the VastChain has a linear ad, it will be true if it contains a VPAID creative and false otherwise.
   */
  vpaid?: boolean
}

/**
 * Data Object with the macros's variables.
 */
export type MacroData = Record<string, any>

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
) => HTMLImageElement

export interface VastEventTrackerOptions {
  /**
   * Data Object with the macros's variables.
   */
  data?: MacroData
  /**
   * Error code. Needed if we are tracking an error.
   */
  errorCode?: number
  /**
   * Optional tracker to use for the actual tracking. Defaults to the pixel tracker.
   */
  tracker?: PixelTracker
  /**
   * Optional logger instance.
   * Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   * Defaults to console.
   */
  logger?: Console
}

/**
 * Options Map
 */
export interface RequestAdOptions extends RequestInit {
  /**
   * Sets the maximum number of wrappers allowed in the {@link VastChain}.
   * Defaults to `5`.
   */
  wrapperLimit?: number
  /**
   * Timeout number in milliseconds. If set, the request will timeout if it is not fulfilled before the specified time.
   */
  timeout?: number
  /**
   * Optional function to track whatever errors occur during the loading.
   * Defaults to `video-ad-tracker` track method.
   */
  tracker?: PixelTracker
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
  useAdBuffet?: boolean
  /**
   * Tells the video player to select an ad from any stand-alone ads available.
   * Note: if the {@link VastChain} contains an adPod this property will be ignored.
   * Defaults to `true`.
   */
  fallbackOnNoAd?: boolean
}

/**
 * Vpaid Creative environment variables
 */
export interface VpaidEnvironmentVars {
  slot?: HTMLElement
  videoSlot?: HTMLVideoElement
  videoSlotCanAutoPlay?: boolean
}

/**
 * The Vpaid Creative ad unit
 */
export interface VpaidCreativeAdUnit {
  handshakeVersion(version: string): string
  initAd(
    width: number,
    height: number,
    mode: string,
    desiredBitrate?: number,
    creativeData?: VpaidCreativeData,
    environmentVars?: VpaidEnvironmentVars
  ): void
  resizeAd(width: number, height: number, mode: string): void
  startAd(): void
  stopAd(): void
  pauseAd(): void
  resumeAd(): void
  expandAd(): void
  skipAd(): void
  collapseAd(): void
  getAdLinear(): void
  getAdWidth(): number
  getAdHeight(): number
  getAdExpanded(): boolean
  getAdSkippableState(): boolean
  getAdRemainingTime(): number
  getAdDuration(): number
  getAdVolume(): number
  getAdCompanions(): unknown[]
  getAdIcons(): VastIcon[]
  setAdVolume(volume: number): void
  subscribe(listener: (...args: any[]) => void, event: string): void
  unsubscribe(listener: (...args: any[]) => void, event: string): void
}

/**
 * The Vpaid execution context.
 */
export interface ExecutionContext extends Window {
  getVPAIDAd(): VpaidCreativeAdUnit
}

/**
 * Hooks to configure the behaviour of the ad.
 */
export interface Hooks {
  /**
   * If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
   */
  createSkipControl?(): HTMLElement
  /**
   * If provided it will be called to generate the click control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
   */
  createClickControl?(): HTMLElement
  /**
   * If provided it will be called to get a {@link MediaFile} by size of the current video element.
   */
  getMediaFile?(mediaFiles: MediaFile[], screenRect: DOMRect): MediaFile
}

/**
 * VAST metric handler data
 */
export interface MetricHandlerData extends Hooks {
  clickThroughUrl?: string
  progressEvents?: VastTrackingEvent[]
  skipoffset?: ParsedOffset
  pauseOnAdClick?: boolean
}

/**
 * Optional type
 */
export type Optional<T> = T | undefined

/**
 * Cancelation function
 */
export type CancelFunction = () => void
