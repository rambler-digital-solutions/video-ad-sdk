import {getVASTAdTagURI, isWrapper} from '../vastSelectors'
import {VastChain} from '../types'
import requestAd, {RequestAdOptions} from './requestAd'
import getNextAd from './helpers/getNextAd'
import {markAdAsRequested} from './helpers/adUtils'

const validateChain = (vastChain: VastChain): void => {
  if (!Array.isArray(vastChain)) {
    throw new TypeError('Invalid VAST chain')
  }

  if (vastChain.length === 0) {
    throw new Error('No next ad to request')
  }
}

/**
 * Options map to {link @requestNextAd}
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
 * Requests the next ad in the VAST Chain.
 *
 * @param vastChain Array of {@link VastResponse}.
 * @param options Options Map. The allowed properties are:
 * @returns Returns a Promise that will resolve with a VastChain with the newest VAST response at the beginning of the array.
 * If the {@link VastChain} had an error. The first VAST response of the array will contain an error and an errorCode entry.
 */
const requestNextAd = (
  vastChain: VastChain,
  options: RequestNextAdOptions
): Promise<VastChain> => {
  validateChain(vastChain)

  const vastResponse = vastChain[0]
  const nextAd = getNextAd(vastResponse, options)

  if (nextAd) {
    const newVastResponse = Object.assign({}, vastResponse, {
      ad: nextAd
    })
    const newVastChain = [newVastResponse, ...vastChain.slice(1)]

    markAdAsRequested(nextAd)

    if (isWrapper(nextAd)) {
      return requestAd(getVASTAdTagURI(nextAd) as string, options, newVastChain)
    }

    return Promise.resolve(newVastChain)
  }

  return requestNextAd(vastChain.slice(1), options)
}

export default requestNextAd
