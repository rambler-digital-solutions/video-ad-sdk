import {parseXml} from '../xml';
import {
  getWrapperOptions,
  getFirstAd,
  getVASTAdTagURI,
  hasAdPod,
  isInline,
  isWrapper
} from '../vastSelectors';
import {
  VastChain,
  VastResponse,
  WrapperOptions,
  ParsedAd,
  ParsedXML,
  RequestAdOptions
} from '../types'
import fetch from './helpers/fetch';
import VastError from './helpers/vastError';
import {markAdAsRequested} from './helpers/adUtils';

const validateChain = (
  vastChain: VastChain,
  {wrapperLimit = 5}: RequestAdOptions
): void => {
  if (vastChain.length > wrapperLimit) {
    const error = new VastError('Wrapper Limit reached');

    error.code = 304;
    throw error;
  }
};

const fetchAdXML = async (
  adTag: string,
  options: RequestInit
): Promise<string> => {
  let response;

  try {
    response = await fetch(adTag, options);
    const XML = await response.text();

    return {response, XML};
  } catch (error) {
    error.code = 502;
    error.response ??= response;

    throw error;
  }
};

const parseVastXml = (xml: string): ParsedXML => {
  try {
    return parseXml(xml);
  } catch (error) {
    error.code = 100;
    throw error;
  }
};

const getAd = (parsedXML: ParsedXML): ParsedAd => {
  try {
    const ad = getFirstAd(parsedXML);

    if (ad) {
      markAdAsRequested(ad);

      return ad;
    }

    throw new Error('No Ad');
  } catch (error) {
    error.code = 303;
    throw error;
  }
};

const validateResponse = (
  {ad, parsedXML}: VastResponse,
  {
    allowMultipleAds = true,
    followAdditionalWrappers = true
  }: RequestAdOptions & WrapperOptions
): void => {
  if (!isWrapper(ad) && !isInline(ad)) {
    const error = new VastError(
      'Invalid VAST, ad contains neither Wrapper nor Inline'
    );

    error.code = 101;
    throw error;
  }

  if (hasAdPod(parsedXML) && !allowMultipleAds) {
    const error = new VastError('Multiple ads are not allowed');

    error.code = 203;
    throw error;
  }

  if (isWrapper(ad) && !followAdditionalWrappers) {
    const error = new VastError('To follow additional wrappers is not allowed');

    error.code = 200;
    throw error;
  }
};

const getOptions = (
  vastChain: VastChain,
  options: RequestAdOptions
): RequestAdOptions & WrapperOptions => {
  const parentAd = vastChain[0];
  const parentAdIsWrapper =
    Boolean(parentAd) && parentAd.ad && isWrapper(parentAd.ad);
  const wrapperOptions =
    parentAdIsWrapper && parentAd.ad ? getWrapperOptions(parentAd.ad) : {};

  return {
    ...wrapperOptions,
    ...options
  };
};

/**
 * Request the ad using the passed ad tag and returns an array with the [VAST responses]{@link VastResponse} needed to get an inline ad.
 *
 * @param adTag The VAST ad tag request url.
 * @param options Options Map. The allowed properties are:
 * @param vastChain Optional vastChain with the previous VAST responses.
 * @returns Returns a Promise that will resolve with a VastChain with the newest VAST response at the beginning of the array.
 * If the {@link VastChain} had an error. The first VAST response of the array will contain an error and an errorCode entry.
 */
const requestAd = async (
  adTag: string,
  options: RequestAdOptions,
  vastChain: VastChain = []
): Promise<VastChain> => {
  const vastAdResponse: VastResponse = {
    ad: null,
    errorCode: null,
    parsedXML: null,
    requestTag: adTag,
    XML: null
  };
  let epoch: number | undefined;
  let timeout: number | undefined;

  try {
    const resultOptions = getOptions(vastChain, options);
    validateChain(vastChain, resultOptions);

    let fetchPromise = fetchAdXML(adTag, resultOptions);

    if (typeof resultOptions.timeout === 'number') {
      timeout = resultOptions.timeout;
      epoch = Date.now();
      fetchPromise = Promise.race<string>([
        fetchPromise,
        new Promise<string>((_resolve, reject) => {
          setTimeout(() => {
            const error = new VastError('RequestAd timeout');

            error.code = 301;
            reject(error);
          }, timeout);
        })
      ]);
    }

    const {response, XML} = await fetchPromise;

    vastAdResponse.response = response;
    vastAdResponse.XML = XML;
    vastAdResponse.parsedXML = parseVastXml(vastAdResponse.XML);
    vastAdResponse.ad = getAd(vastAdResponse.parsedXML);

    validateResponse(vastAdResponse, resultOptions);

    if (vastAdResponse.ad && isWrapper(vastAdResponse.ad)) {
      if (epoch && timeout) {
        timeout -= Date.now() - epoch;
      }

      return requestAd(
        getVASTAdTagURI(vastAdResponse.ad) as string,
        {
          ...resultOptions,
          timeout
        },
        [vastAdResponse, ...vastChain]
      );
    }

    return [vastAdResponse, ...vastChain];
  } catch (error) {
    /* istanbul ignore if */
    if (!Number.isInteger(error.code)) {
      error.code = 900;
    }

    vastAdResponse.errorCode = error.code;
    vastAdResponse.error = error;
    vastAdResponse.response ??= error.response;

    return [vastAdResponse, ...vastChain];
  }
};

export default requestAd;
