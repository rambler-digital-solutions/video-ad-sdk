import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from '../xml';
import parseOffset from './helpers/parseOffset';
import getLinearCreative from './helpers/getLinearCreative';
import getLinearTrackingEvents from './getLinearTrackingEvents';
import getNonLinearTrackingEvents from './getNonLinearTrackingEvents';
import getIcons from './getIcons';
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
} from '../types';

const getBooleanValue = (val: unknown): boolean => {
  if (typeof val === 'string') {
    return val === 'true';
  }

  return Boolean(val);
};

const compareBySequence = (itemA: ParsedXML, itemB: ParsedXML): number => {
  const itemASequenceString = getAttribute(itemA, 'sequence');
  const itemBSequenceString = getAttribute(itemB, 'sequence');
  const itemASequence =
    itemASequenceString && parseInt(itemASequenceString, 10);
  const itemBSequence =
    itemBSequenceString && parseInt(itemBSequenceString, 10);

  if (typeof itemASequence !== 'string' || typeof itemBSequence !== 'string') {
    return 0;
  }

  if (itemASequence < itemBSequence) {
    return -1;
  }

  if (itemASequence > itemBSequence) {
    return 1;
  }

  return 0;
};

/**
 * Selects the ads of the passed VAST.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns Array of ads or empty array.
 */
export const getAds = (parsedVast: ParsedVast | null): ParsedAd[] => {
  const vastElement = parsedVast && get(parsedVast, 'VAST');
  const ads = vastElement && getAll(vastElement, 'Ad');

  if (ads && ads.length > 0) {
    return ads;
  }

  return [];
};

/**
 * Gets the Error URI of the passed parsed VAST xml.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns array of the Vast Error URI or `null` otherwise.
 */
export const getVastErrorURI = (
  parsedVast: ParsedVast | null
): VastMacro[] | null => {
  const vastElement = parsedVast && get(parsedVast, 'VAST');

  if (vastElement) {
    const errors = getAll(vastElement, 'Error');

    if (errors && errors.length > 0) {
      return errors.map((error) => getText(error) ?? '').filter(Boolean);
    }
  }

  return null;
};

/**
 * Gets the sequence of the pod ad.
 *
 * @param ad Parsed ad definition object.
 * @returns The pod ad sequence number or `null`.
 */
export const getPodAdSequence = (ad: ParsedAd): number | null => {
  const sequenceString = getAttribute(ad, 'sequence');
  const sequence = sequenceString && parseInt(sequenceString, 10);

  if (typeof sequence === 'number' && !isNaN(sequence)) {
    return sequence;
  }

  return null;
};

/**
 * Checks if the passed ad definition is a pod ad.
 *
 * @param ad Parsed ad definition object.
 * @returns Returns true if there the ad is a pod ad and false otherwise.
 */
export const isPodAd = (ad: ParsedAd): boolean => Boolean(getPodAdSequence(ad));

/**
 * Checks if the passed array of ads have an ad pod.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns Returns true if there is an ad pod in the array and false otherwise.
 */
export const hasAdPod = (parsedVast: ParsedVast | null): boolean => {
  const ads = getAds(parsedVast);

  return Array.isArray(ads) && ads.filter(isPodAd).length > 1;
};

/**
 * Returns true if the passed vastChain has an ad pod or false otherwise.
 *
 * @param vastChain Array of VAST responses. See `load` or `requestAd` for more info.
 * @returns True if the vastChain contains an ad pod and false otherwise.
 */
export const isAdPod = (vastChain: VastChain = []): boolean =>
  vastChain.map(({parsedXML}) => parsedXML).some(hasAdPod);

/**
 * Selects the first ad of the passed VAST. If the passed VAST response contains an ad pod it will return the first ad in the ad pod sequence.
 *
 * @param parsedVast Parsed VAST xml.
 * @returns First ad of the VAST xml or `null`.
 */
export const getFirstAd = (parsedVast: ParsedVast | null): ParsedAd | null => {
  const ads = getAds(parsedVast);

  if (Array.isArray(ads) && ads.length > 0) {
    if (hasAdPod(parsedVast)) {
      return ads.filter(isPodAd).sort(compareBySequence)[0];
    }

    return ads[0];
  }

  return null;
};

/**
 * Checks if the passed ad is a Wrapper.
 *
 * @param ad VAST ad object.
 * @returns `true` if the ad contains a wrapper and `false` otherwise.
 */
export const isWrapper = (ad: ParsedAd | null): boolean =>
  Boolean(get(ad || ({} as ParsedXML), 'Wrapper'));

/**
 * Checks if the passed ad is an Inline.
 *
 * @param ad VAST ad object.
 * @returns Returns `true` if the ad contains an Inline or `false` otherwise.
 */
export const isInline = (ad: ParsedAd | null): boolean =>
  Boolean(get(ad || ({} as ParsedXML), 'Inline'));

/**
 * Returns the VASTAdTagURI from the wrapper ad.
 *
 * @param ad VAST ad object.
 * @returns Returns the VASTAdTagURI from the wrapper ad or `null` otherwise.
 */
export const getVASTAdTagURI = (ad: ParsedAd): string | null => {
  const wrapperElement = get(ad, 'Wrapper');
  const vastAdTagURIElement =
    wrapperElement && get(wrapperElement, 'VastAdTagUri');

  if (vastAdTagURIElement) {
    return getText(vastAdTagURIElement) || null;
  }

  return null;
};

/**
 * Returns the options from the wrapper ad.
 *
 * @param ad VAST ad object.
 * @returns Returns the options from the wrapper ad.
 */
export const getWrapperOptions = (ad: ParsedAd): WrapperOptions => {
  const wrapperElement = get(ad, 'Wrapper');
  const options: WrapperOptions = {};

  if (wrapperElement) {
    const {allowMultipleAds, fallbackOnNoAd, followAdditionalWrappers} =
      getAttributes(wrapperElement);

    if (allowMultipleAds) {
      options.allowMultipleAds = getBooleanValue(allowMultipleAds);
    }

    if (fallbackOnNoAd) {
      options.fallbackOnNoAd = getBooleanValue(fallbackOnNoAd);
    }

    if (followAdditionalWrappers) {
      options.followAdditionalWrappers = getBooleanValue(
        followAdditionalWrappers
      );
    }
  }

  return options;
};

/**
 * Gets the Error URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad Error URI or `null` otherwise.
 */
export const getAdErrorURI = (ad: ParsedAd): string[] | null => {
  const adTypeElement = ad && getFirstChild(ad);

  if (adTypeElement) {
    const errors = getAll(adTypeElement, 'Error');

    if (errors && errors.length > 0) {
      return errors.map((error) => getText(error) ?? '').filter(Boolean);
    }
  }

  return null;
};

/**
 * Gets array of the Impression URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad Impression URI or `null` otherwise.
 */
export const getImpression = (ad: ParsedAd): string[] | null => {
  const adTypeElement = ad && getFirstChild(ad);
  const impressions = adTypeElement && getAll(adTypeElement, 'Impression');

  if (impressions && impressions.length > 0) {
    return impressions
      .map((impression: ParsedXML) => getText(impression) ?? '')
      .filter(Boolean);
  }

  return null;
};

/**
 * Gets array of the Viewable URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad Viewable URI or `null` otherwise.
 */
export const getViewable = (ad: ParsedAd): string[] | null => {
  const adTypeElement = ad && getFirstChild(ad);
  const viewableImpression =
    adTypeElement && get(adTypeElement, 'ViewableImpression');
  const viewableElements =
    viewableImpression && getAll(viewableImpression, 'Viewable');

  if (viewableElements && viewableElements.length > 0) {
    return viewableElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean);
  }

  return null;
};

/**
 * Gets array of the NotViewable URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad NotViewable URI or `null` otherwise.
 */
export const getNotViewable = (ad: ParsedAd): string[] | null => {
  const adTypeElement = ad && getFirstChild(ad);
  const viewableImpression =
    adTypeElement && get(adTypeElement, 'ViewableImpression');
  const notViewableElements =
    viewableImpression && getAll(viewableImpression, 'NotViewable');

  if (notViewableElements && notViewableElements.length > 0) {
    return notViewableElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean);
  }

  return null;
};

/**
 * Gets array of the ViewUndetermined URI of the passed ad.
 *
 * @param ad VAST ad object.
 * @returns array of the Vast ad ViewUndetermined URI or `null` otherwise.
 */
export const getViewUndetermined = (ad: ParsedAd): string[] | null => {
  const adTypeElement = ad && getFirstChild(ad);
  const viewableImpression =
    adTypeElement && get(adTypeElement, 'ViewableImpression');
  const viewUndeterminedElements =
    viewableImpression && getAll(viewableImpression, 'ViewUndetermined');

  if (viewUndeterminedElements && viewUndeterminedElements.length > 0) {
    return viewUndeterminedElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean);
  }

  return null;
};

/**
 * Gets the ad's MediaFiles.
 *
 * @param ad VAST ad object.
 * @returns array of media files or null
 */
export const getMediaFiles = (ad: ParsedAd): MediaFile[] | null => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const universalAdIdElement = get(creativeElement, 'UniversalAdId');
    const universalAdId =
      (universalAdIdElement && getText(universalAdIdElement)) || null;
    const linearElement = get(creativeElement, 'Linear');
    const mediaFilesElement = linearElement && get(linearElement, 'MediaFiles');
    const mediaFileElements =
      mediaFilesElement && getAll(mediaFilesElement, 'MediaFile');

    if (mediaFileElements && mediaFileElements.length > 0) {
      return mediaFileElements.map((mediaFileElement: ParsedXML) => {
        const src = getText(mediaFileElement);
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
        } = getAttributes(mediaFileElement);

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
        };
      });
    }
  }

  return null;
};

/**
 * Gets the ad's InteractiveFiles. That were added with the `InteractiveCreativeFile` tag.
 *
 * @param ad VAST ad object.
 * @returns array of media files or null
 */
export const getInteractiveCreativeFiles = (
  ad: ParsedAd
): InteractiveFile[] | null => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const linearElement = get(creativeElement, 'Linear');
    const mediaFilesElement = linearElement && get(linearElement, 'MediaFiles');
    const interactiveElements =
      mediaFilesElement && getAll(mediaFilesElement, 'InteractiveCreativeFile');

    if (interactiveElements && interactiveElements.length > 0) {
      return interactiveElements.map((interactiveElement: ParsedXML) => {
        const {apiFramework, type} = getAttributes(interactiveElement);
        const src = getText(interactiveElement);

        return {
          apiFramework,
          src,
          type
        };
      });
    }
  }

  return null;
};

/**
 * Gets all the ad's InteractiveFiles.
 *
 * @param ad VAST ad object.
 * @returns array of media files or null
 */
export const getInteractiveFiles = (ad: ParsedAd): InteractiveFile[] | null => {
  let interactiveFiles = getInteractiveCreativeFiles(ad);

  if (interactiveFiles) {
    return interactiveFiles;
  }

  const mediaFiles = getMediaFiles(ad);

  if (mediaFiles) {
    interactiveFiles = mediaFiles
      .filter(({apiFramework = ''}) => apiFramework?.toLowerCase() === 'vpaid')
      .map(({apiFramework, src, type}) => ({
        apiFramework,
        src,
        type
      }));

    if (interactiveFiles.length > 0) {
      return interactiveFiles;
    }
  }

  return null;
};

const getVideoClicksElement = (ad: ParsedAd): ParsedXML | null => {
  const creativeElement = ad && getLinearCreative(ad);
  const linearElement = creativeElement && get(creativeElement, 'Linear');
  const videoClicksElement = linearElement && get(linearElement, 'VideoClicks');

  if (videoClicksElement) {
    return videoClicksElement;
  }

  return null;
};

/**
 * Gets the click through {@link VastMacro}.
 *
 * @param ad VAST ad object.
 * @returns clickthrough macro
 */
export const getClickThrough = (ad: ParsedAd): VastMacro | null => {
  const videoClicksElement = getVideoClicksElement(ad);
  const clickThroughElement =
    videoClicksElement && get(videoClicksElement, 'ClickThrough');

  if (clickThroughElement) {
    return getText(clickThroughElement);
  }

  return null;
};

/**
 * Gets the click through {@link VAST-macro}.
 *
 * @param ad VAST ad object.
 * @returns click tracking macro
 */
export const getClickTracking = (ad: ParsedAd): VastMacro[] | null => {
  const videoClicksElement = ad && getVideoClicksElement(ad);
  const clickTrackingElements =
    videoClicksElement && getAll(videoClicksElement, 'ClickTracking');

  if (clickTrackingElements && clickTrackingElements.length > 0) {
    return clickTrackingElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean);
  }

  return null;
};

/**
 * Gets the custom click {@link VAST-macro}.
 *
 * @param ad VAST ad object.
 * @returns click tracking macro
 */
export const getCustomClick = (ad: ParsedAd): VastMacro[] | null => {
  const videoClicksElement = getVideoClicksElement(ad);
  const customClickElements =
    videoClicksElement && getAll(videoClicksElement, 'CustomClick');

  if (customClickElements && customClickElements.length > 0) {
    return customClickElements
      .map((element) => getText(element) ?? '')
      .filter(Boolean);
  }

  return null;
};

/**
 * Gets the skipoffset.
 *
 * @param ad VAST ad object.
 * @returns the time offset in milliseconds or a string with the percentage or null
 */
export const getSkipOffset = (ad: ParsedAd): ParsedOffset | null => {
  const creativeElement = ad && getLinearCreative(ad);
  const linearElement = creativeElement && get(creativeElement, 'Linear');
  const skipoffset = linearElement && getAttribute(linearElement, 'skipoffset');

  if (skipoffset) {
    return parseOffset(skipoffset);
  }

  return null;
};

const getLinearContent = (xml: string): string | null => {
  const linearRegex = /<Linear([\s\S]*)<\/Linear/gm;
  const result = linearRegex.exec(xml);

  return result?.[1] ?? null;
};

const getAdParametersContent = (xml: string): string | null => {
  const paramsRegex = /<AdParameters[\s\w="]*>([\s\S]*)<\/AdParameters>/gm;
  const result = paramsRegex.exec(xml);

  return (
    result?.[1]
      .replace(/[\n\s]*<!\[CDATA\[[\n\s]*/, '')
      .replace(/[\n\s]*\]\]>[\n\s]*$/, '')

      // unescape nested CDATA
      .replace(/\]\]\]\]><!\[CDATA\[>/, ']]>')
      .trim() || null
  );
};

const getXmlEncodedValue = (xml: string): boolean => {
  const xmlEncodedRegex = /<AdParameters[\s]*xmlEncoded="(.*?)">/gim;
  const result = xmlEncodedRegex.exec(xml);

  return result?.[1] === 'true';
};

/**
 * Gets the creative data.
 *
 * @param xml VAST XML text.
 * @returns with `AdParameters` as they come in the XML and a flag `xmlEncoded` to indicate if the ad parameters are xml encoded.
 */
export const getCreativeData = (xml: string): CreativeData => {
  const linearContent = getLinearContent(xml);
  const AdParameters = linearContent && getAdParametersContent(linearContent);
  const xmlEncoded = linearContent ? getXmlEncodedValue(linearContent) : false;

  return {
    AdParameters,
    xmlEncoded
  };
};

export {getIcons, getLinearTrackingEvents, getNonLinearTrackingEvents};
