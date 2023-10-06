import {getVASTAdTagURI, isWrapper} from '../vastSelectors'
import {RequestNextAdOptions, VastChain} from '../types'
import requestAd from './requestAd'
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
