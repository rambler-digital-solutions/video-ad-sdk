import {parseXml} from '../xml'
import {isVastErrorCode, ErrorCode} from '../tracker'
import {
  getWrapperOptions,
  getFirstAd,
  getVASTAdTagURI,
  hasAdPod,
  isInline,
  isWrapper
} from '../vastSelectors'
import {
  VastChain,
  VastResponse,
  WrapperOptions,
  ParsedAd,
  ParsedXML,
  Optional,
  PixelTracker
} from '../types'
import fetch from './helpers/fetch'
import VastError from './helpers/vastError'
import {markAdAsRequested} from './helpers/adUtils'

/**
 * Options map to {@link requestAd}
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

const validateChain = (
  vastChain: VastChain,
  {wrapperLimit = 5}: RequestAdOptions
): void => {
  if (vastChain.length > wrapperLimit) {
    const error = new VastError('Wrapper Limit reached')

    error.code = ErrorCode.VAST_TOO_MANY_REDIRECTS
    throw error
  }
}

interface FetchAdResponse {
  response: Response
  XML: string
}

const fetchAdXML = async (
  adTag: string,
  options: RequestInit
): Promise<FetchAdResponse> => {
  let response

  try {
    response = await fetch(adTag, options)

    const XML = await response.text()

    return {response, XML}
  } catch (error: any) {
    error.code = ErrorCode.VAST_NONLINEAR_LOADING_FAILED
    error.response ??= response

    throw error
  }
}

const parseVastXml = (xml: string): ParsedXML => {
  try {
    return parseXml(xml)
  } catch (error: any) {
    error.code = ErrorCode.VAST_XML_PARSING_ERROR
    throw error
  }
}

const getAd = (parsedXML: ParsedXML): ParsedAd => {
  try {
    const ad = getFirstAd(parsedXML)

    if (ad) {
      markAdAsRequested(ad)

      return ad
    }

    throw new Error('No Ad')
  } catch (error: any) {
    error.code = ErrorCode.VAST_NO_ADS_AFTER_WRAPPER
    throw error
  }
}

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
    )

    error.code = ErrorCode.VAST_SCHEMA_VALIDATION_ERROR
    throw error
  }

  if (hasAdPod(parsedXML) && !allowMultipleAds) {
    const error = new VastError('Multiple ads are not allowed')

    error.code = ErrorCode.VAST_UNEXPECTED_MEDIA_FILE
    throw error
  }

  if (isWrapper(ad) && !followAdditionalWrappers) {
    const error = new VastError('To follow additional wrappers is not allowed')

    error.code = ErrorCode.VAST_UNEXPECTED_AD_TYPE
    throw error
  }
}

const getOptions = (
  vastChain: VastChain,
  options: RequestAdOptions
): RequestAdOptions & WrapperOptions => {
  const parentAd = vastChain[0]
  const parentAdIsWrapper =
    Boolean(parentAd) && parentAd.ad && isWrapper(parentAd.ad)
  const wrapperOptions =
    parentAdIsWrapper && parentAd.ad ? getWrapperOptions(parentAd.ad) : {}

  return {
    ...wrapperOptions,
    ...options
  }
}

/**
 * Request the ad using the passed ad tag and returns an array with the {@link VastResponse} needed to get an inline ad.
 *
 * @param adTag The VAST ad tag request url.
 * @param options Options Map. The allowed properties are:
 * @param vastChain Optional vastChain with the previous VAST responses.
 * @returns Returns a Promise that will resolve with a VastChain with the newest VAST response at the beginning of the array.
 * If the {@link VastChain} had an error. The first VAST response of the array will contain an error and an errorCode entry.
 */
const requestAd = async (
  adTag: string,
  options: RequestAdOptions & WrapperOptions,
  vastChain: VastChain = []
): Promise<VastChain> => {
  const vastAdResponse: VastResponse = {
    requestTag: adTag
  }
  let epoch: Optional<number>
  let timeout: Optional<number>

  try {
    const resultOptions = getOptions(vastChain, options)

    validateChain(vastChain, resultOptions)

    let fetchPromise = fetchAdXML(adTag, resultOptions)

    if (typeof resultOptions.timeout === 'number') {
      timeout = resultOptions.timeout
      epoch = Date.now()
      fetchPromise = Promise.race<FetchAdResponse>([
        fetchPromise,
        new Promise<never>((_resolve, reject) => {
          setTimeout(() => {
            const error = new VastError('RequestAd timeout')

            error.code = ErrorCode.VAST_LOAD_TIMEOUT
            reject(error)
          }, timeout)
        })
      ])
    }

    const {response, XML} = await fetchPromise

    vastAdResponse.response = response
    vastAdResponse.XML = XML
    vastAdResponse.parsedXML = parseVastXml(vastAdResponse.XML)
    vastAdResponse.ad = getAd(vastAdResponse.parsedXML)

    validateResponse(vastAdResponse, resultOptions)

    if (isWrapper(vastAdResponse.ad)) {
      if (epoch && timeout) {
        timeout -= Date.now() - epoch
      }

      return requestAd(
        getVASTAdTagURI(vastAdResponse.ad) as string,
        {
          ...resultOptions,
          timeout
        },
        [vastAdResponse, ...vastChain]
      )
    }

    return [vastAdResponse, ...vastChain]
  } catch (error: any) {
    /* istanbul ignore if */
    if (!isVastErrorCode(error.code)) {
      error.code = ErrorCode.UNKNOWN_ERROR
    }

    vastAdResponse.errorCode = error.code
    vastAdResponse.error = error
    vastAdResponse.response ??= error.response

    return [vastAdResponse, ...vastChain]
  }
}

export default requestAd
