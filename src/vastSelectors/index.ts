import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from '../xml'
import parseOffset from './helpers/parseOffset'
import getLinearCreative from './helpers/getLinearCreative'
import getLinearTrackingEvents from './getLinearTrackingEvents'
import getNonLinearTrackingEvents from './getNonLinearTrackingEvents'
import getIcons from './getIcons'
import {
  ParsedVast,
  ParsedAd,
  ParsedXML,
  VastChain,
  VastMacro,
  WrapperOptions,
  MediaFile,
  InteractiveFile,
  ParsedOffset,
  CreativeData
} from '../types'

const getBooleanValue = (val: unknown): boolean => {
  if (typeof val === 'string') {
    return val === 'true'
  }

  return Boolean(val)
}

const compareBySequence = (itemA: ParsedXML, itemB: ParsedXML): number => {
  const itemASequenceString = getAttribute(itemA, 'sequence')
  const itemBSequenceString = getAttribute(itemB, 'sequence')
  const itemASequence = itemASequenceString && parseInt(itemASequenceString, 10)
  const itemBSequence = itemBSequenceString && parseInt(itemBSequenceString, 10)

  if (typeof itemASequence !== 'string' || typeof itemBSequence !== 'string') {
    return 0
  }

  if (itemASequence < itemBSequence) {
    return -1
  }

  if (itemASequence > itemBSequence) {
    return 1
  }

  return 0
}

/**
 * Selects the ads of the passed VAST.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns Array of ads or empty array.
 */
export const getAds = (parsedVast?: ParsedVast): ParsedAd[] => {
  const vastElement = parsedVast && get(parsedVast, 'VAST')
  const ads = vastElement && getAll(vastElement, 'Ad')

  if (ads && ads.length > 0) {
    return ads
  }

  return []
}

/**
 * Gets the Error URI of the passed parsed VAST xml.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns array of the Vast Error URI
 */
export const getVastErrorURI = (
  parsedVast?: ParsedVast
): Optional<VastMacro[]> => {
  const vastElement = parsedVast && get(parsedVast, 'VAST')
  const errors = vastElement && getAll(vastElement, 'Error')

  if (errors && errors.length > 0) {
    return errors.map((error) => getText(error) ?? '').filter(Boolean)
  }
}

/**
 * Gets the sequence of the pod ad.
 *
 * @param ad Parsed ad definition object.
 * @returns The pod ad sequence number.
 */
export const getPodAdSequence = (ad: ParsedAd): Optional<number> => {
  const sequenceString = getAttribute(ad, 'sequence')
  const sequence = sequenceString && parseInt(sequenceString, 10)

  if (typeof sequence === 'number' && !isNaN(sequence)) {
    return sequence
  }
}

/**
 * Checks if the passed ad definition is a pod ad.
 *
 * @param ad Parsed ad definition object.
 * @returns Returns true if there the ad is a pod ad and false otherwise.
 */
export const isPodAd = (ad: ParsedAd): boolean => Boolean(getPodAdSequence(ad))

/**
 * Checks if the passed array of ads have an ad pod.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns Returns true if there is an ad pod in the array and false otherwise.
 */
export const hasAdPod = (parsedVast?: ParsedVast): boolean => {
  const ads = getAds(parsedVast)

  return Array.isArray(ads) && ads.filter(isPodAd).length > 1
}

/**
 * Returns true if the passed vastChain has an ad pod or false otherwise.
 *
 * @param vastChain Array of VAST responses. See `load` or `requestAd` for more info.
 * @returns True if the vastChain contains an ad pod and false otherwise.
 */
export const isAdPod = (vastChain: VastChain = []): boolean =>
  vastChain.map(({parsedXML}) => parsedXML).some(hasAdPod)

/**
 * Selects the first ad of the passed VAST. If the passed VAST response contains an ad pod it will return the first ad in the ad pod sequence.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns First ad of the VAST xml.
 */
export const getFirstAd = (parsedVast?: ParsedVast): Optional<ParsedAd> => {
  const ads = getAds(parsedVast)

  if (Array.isArray(ads) && ads.length > 0) {
    if (hasAdPod(parsedVast)) {
      return ads.filter(isPodAd).sort(compareBySequence)[0]
    }

    return ads[0]
  }
}

/**
 * Checks if the passed ad is a Wrapper.
 *
 * @param ad VAST ad object.
 * @returns `true` if the ad contains a wrapper and `false` otherwise.
 */
export const isWrapper = (ad?: ParsedAd): boolean =>
  Boolean(get(ad || ({} as ParsedXML), 'Wrapper'))

/**
 * Checks if the passed ad is an Inline.
 *
 * @param ad VAST ad object.
 * @returns Returns `true` if the ad contains an Inline or `false` otherwise.
 */
export const isInline = (ad?: ParsedAd): boolean =>
  Boolean(get(ad || ({} as ParsedXML), 'Inline'))

/**
 * Returns the VASTAdTagURI from the wrapper ad.
 *
 * @param ad VAST ad object.
 * @returns Returns the VASTAdTagURI from the wrapper ad.
 */
export const getVASTAdTagURI = (ad: ParsedAd): Optional<string> => {
  const wrapperElement = get(ad, 'Wrapper')
  const vastAdTagURIElement =
    wrapperElement && get(wrapperElement, 'VastAdTagUri')

  return vastAdTagURIElement && getText(vastAdTagURIElement)
}

/**
 * Returns the options from the wrapper ad.
 *
 * @param ad VAST ad object.
 * @returns Returns the options from the wrapper ad.
 */
export const getWrapperOptions = (ad: ParsedAd): WrapperOptions => {
  const wrapperElement = get(ad, 'Wrapper')
  const options: WrapperOptions = {}

  if (wrapperElement) {
    const {allowMultipleAds, fallbackOnNoAd, followAdditionalWrappers} =
      getAttributes(wrapperElement)

    if (allowMultipleAds) {
      options.allowMultipleAds = getBooleanValue(allowMultipleAds)
    }

    if (fallbackOnNoAd) {
      options.fallbackOnNoAd = getBooleanValue(fallbackOnNoAd)
    }

    if (followAdditionalWrappers) {
      options.followAdditionalWrappers = getBooleanValue(
        followAdditionalWrappers
      )
    }
  }

  return options
}

/**
 * Gets the Error URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad Error URI.
 */
export const getAdErrorURI = (ad: ParsedAd): Optional<string[]> => {
  const adTypeElement = ad && getFirstChild(ad)
  const errors = adTypeElement && getAll(adTypeElement, 'Error')

  if (errors && errors.length > 0) {
    return errors.map((error) => getText(error) ?? '').filter(Boolean)
  }
}

/**
 * Gets array of the Impression URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad Impression URI.
 */
export const getImpression = (ad: ParsedAd): Optional<string[]> => {
  const adTypeElement = ad && getFirstChild(ad)
  const impressions = adTypeElement && getAll(adTypeElement, 'Impression')

  if (impressions && impressions.length > 0) {
    return impressions
      .map((impression: ParsedXML) => getText(impression) ?? '')
      .filter(Boolean)
  }
}

/**
 * Gets array of the Viewable URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad Viewable URI.
 */
export const getViewable = (ad: ParsedAd): Optional<string[]> => {
  const adTypeElement = ad && getFirstChild(ad)
  const viewableImpression =
    adTypeElement && get(adTypeElement, 'ViewableImpression')
  const viewableElements =
    viewableImpression && getAll(viewableImpression, 'Viewable')

  if (viewableElements && viewableElements.length > 0) {
    return viewableElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean)
  }
}

/**
 * Gets array of the NotViewable URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad NotViewable URI.
 */
export const getNotViewable = (ad: ParsedAd): Optional<string[]> => {
  const adTypeElement = ad && getFirstChild(ad)
  const viewableImpression =
    adTypeElement && get(adTypeElement, 'ViewableImpression')
  const notViewableElements =
    viewableImpression && getAll(viewableImpression, 'NotViewable')

  if (notViewableElements && notViewableElements.length > 0) {
    return notViewableElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean)
  }
}

/**
 * Gets array of the ViewUndetermined URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad ViewUndetermined URI.
 */
export const getViewUndetermined = (ad: ParsedAd): Optional<string[]> => {
  const adTypeElement = ad && getFirstChild(ad)
  const viewableImpression =
    adTypeElement && get(adTypeElement, 'ViewableImpression')
  const viewUndeterminedElements =
    viewableImpression && getAll(viewableImpression, 'ViewUndetermined')

  if (viewUndeterminedElements && viewUndeterminedElements.length > 0) {
    return viewUndeterminedElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean)
  }
}

/**
 * Gets the ad's MediaFiles.
 *
 * @param ad VAST ad object.
 * @returns array of media files
 */
export const getMediaFiles = (ad: ParsedAd): Optional<MediaFile[]> => {
  const creativeElement = ad && getLinearCreative(ad)
  const universalAdIdElement = creativeElement && get(creativeElement, 'UniversalAdId')
  const universalAdId = universalAdIdElement && getText(universalAdIdElement)
  const linearElement = creativeElement && get(creativeElement, 'Linear')
  const mediaFilesElement = linearElement && get(linearElement, 'MediaFiles')
  const mediaFileElements =
    mediaFilesElement && getAll(mediaFilesElement, 'MediaFile')

  if (mediaFileElements && mediaFileElements.length > 0) {
    return mediaFileElements.map((mediaFileElement: ParsedXML) => {
      const src = getText(mediaFileElement)
      const {
        apiFramework,
        bitrate,
        codec,
        delivery,
        height,
        id,
        maintainAspectRatio,
        maxBitrate,
        minBitrate,
        scalable,
        type,
        width
      } = getAttributes(mediaFileElement)

      return {
        apiFramework,
        bitrate,
        codec,
        delivery,
        height,
        id,
        maintainAspectRatio,
        maxBitrate,
        minBitrate,
        scalable,
        src,
        type,
        universalAdId,
        width
      }
    })
  }
}

/**
 * Gets the ad's InteractiveFiles. That were added with the `InteractiveCreativeFile` tag.
 *
 * @param ad VAST ad object.
 * @returns array of media files.
 */
export const getInteractiveCreativeFiles = (
  ad: ParsedAd
): Optional<InteractiveFile[]> => {
  const creativeElement = ad && getLinearCreative(ad)

  const linearElement = creativeElement && get(creativeElement, 'Linear')
  const mediaFilesElement = linearElement && get(linearElement, 'MediaFiles')
  const interactiveElements =
    mediaFilesElement && getAll(mediaFilesElement, 'InteractiveCreativeFile')

  if (interactiveElements && interactiveElements.length > 0) {
    return interactiveElements.map((interactiveElement: ParsedXML) => {
      const {apiFramework, type} = getAttributes(interactiveElement)
      const src = getText(interactiveElement)

      return {
        apiFramework,
        src,
        type
      }
    })
  }
}

/**
 * Gets all the ad's InteractiveFiles.
 *
 * @param ad VAST ad object.
 * @returns array of media files
 */
export const getInteractiveFiles = (ad: ParsedAd): Optional<InteractiveFile[]> => {
  let interactiveFiles = getInteractiveCreativeFiles(ad)

  if (interactiveFiles) {
    return interactiveFiles
  }

  const mediaFiles = getMediaFiles(ad)

  if (mediaFiles) {
    interactiveFiles = mediaFiles
      .filter(({apiFramework = ''}) => apiFramework?.toLowerCase() === 'vpaid')
      .map(({apiFramework, src, type}) => ({
        apiFramework,
        src,
        type
      }))

    if (interactiveFiles.length > 0) {
      return interactiveFiles
    }
  }
}

const getVideoClicksElement = (ad: ParsedAd): Optional<ParsedXML> => {
  const creativeElement = ad && getLinearCreative(ad)
  const linearElement = creativeElement && get(creativeElement, 'Linear')

  return linearElement && get(linearElement, 'VideoClicks')
}

/**
 * Gets the click through {@link VastMacro}.
 *
 * @param ad VAST ad object.
 * @returns clickthrough macro
 */
export const getClickThrough = (ad: ParsedAd): Optional<VastMacro> => {
  const videoClicksElement = getVideoClicksElement(ad)
  const clickThroughElement =
    videoClicksElement && get(videoClicksElement, 'ClickThrough')

  return clickThroughElement && getText(clickThroughElement)
}

/**
 * Gets the click through {@link VAST-macro}.
 *
 * @param ad VAST ad object.
 * @returns click tracking macro
 */
export const getClickTracking = (ad: ParsedAd): Optional<VastMacro[]> => {
  const videoClicksElement = ad && getVideoClicksElement(ad)
  const clickTrackingElements =
    videoClicksElement && getAll(videoClicksElement, 'ClickTracking')

  if (clickTrackingElements && clickTrackingElements.length > 0) {
    return clickTrackingElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean)
  }
}

/**
 * Gets the custom click {@link VAST-macro}.
 *
 * @param ad VAST ad object.
 * @returns click tracking macro
 */
export const getCustomClick = (ad: ParsedAd): Optional<VastMacro[]> => {
  const videoClicksElement = getVideoClicksElement(ad)
  const customClickElements =
    videoClicksElement && getAll(videoClicksElement, 'CustomClick')

  if (customClickElements && customClickElements.length > 0) {
    return customClickElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean)
  }
}

/**
 * Gets the skipoffset.
 *
 * @param ad VAST ad object.
 * @returns the time offset in milliseconds or a string with the percentage
 */
export const getSkipOffset = (ad: ParsedAd): Optional<ParsedOffset> => {
  const creativeElement = ad && getLinearCreative(ad)
  const linearElement = creativeElement && get(creativeElement, 'Linear')
  const skipoffset = linearElement && getAttribute(linearElement, 'skipoffset')

  return skipoffset && parseOffset(skipoffset)
}

const getLinearContent = (xml: string): Optional<string> => {
  const linearRegex = /<Linear([\s\S]*)<\/Linear/gm
  const result = linearRegex.exec(xml)

  return result?.[1]
}

const getAdParametersContent = (xml: string): Optional<string> => {
  const paramsRegex = /<AdParameters[\s\w="]*>([\s\S]*)<\/AdParameters>/gm
  const result = paramsRegex.exec(xml)

  return (
    result?.[1]
      .replace(/[\n\s]*<!\[CDATA\[[\n\s]*/, '')
      .replace(/[\n\s]*\]\]>[\n\s]*$/, '')
      // unescape nested CDATA
      .replace(/\]\]\]\]><!\[CDATA\[>/, ']]>')
      .trim()
  )
}

const getXmlEncodedValue = (xml: string): boolean => {
  const xmlEncodedRegex = /<AdParameters[\s]*xmlEncoded="(.*?)">/gim
  const result = xmlEncodedRegex.exec(xml)

  return result?.[1] === 'true'
}

/**
 * Gets the creative data.
 *
 * @param xml VAST XML text.
 * @returns with `AdParameters` as they come in the XML and a flag `xmlEncoded` to indicate if the ad parameters are xml encoded.
 */
export const getCreativeData = (xml: string): CreativeData => {
  const linearContent = getLinearContent(xml)
  const AdParameters = linearContent && getAdParametersContent(linearContent)
  const xmlEncoded = linearContent ? getXmlEncodedValue(linearContent) : false

  return {
    AdParameters,
    xmlEncoded
  }
}

export {getIcons, getLinearTrackingEvents, getNonLinearTrackingEvents}
