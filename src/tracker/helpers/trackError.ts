import {getAdErrorURI, getVastErrorURI} from '../../vastSelectors'
import type {VastEventTrackerOptions, VastChain} from '../../types'
import {pixelTracker} from './pixelTracker'

/**
 * Tracks an error.
 *
 * @param vastChain the ad VAST Chain.
 * @param options Options Map
 */
export const trackError = (
  vastChain: VastChain,
  {errorCode, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  vastChain.forEach(({ad, parsedXML}) => {
    const errorURIs = (ad && getAdErrorURI(ad)) || getVastErrorURI(parsedXML)

    errorURIs?.forEach((uri) => uri && tracker(uri, {errorCode}))
  })
}
