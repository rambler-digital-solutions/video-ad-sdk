import {getAdErrorURI, getVastErrorURI} from '../../vastSelectors'
import {VastEventTrackerOptions, VastChain} from '../../types'
import pixelTracker from './pixelTracker'

/**
 * Tracks an error.
 *
 * @param vastChain the ad VAST Chain.
 * @param options Options Map
 */
const trackError = (
  vastChain: VastChain,
  {errorCode, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  vastChain.forEach(({ad, parsedXML}) => {
    const errorURIs = (ad && getAdErrorURI(ad)) || getVastErrorURI(parsedXML)

    if (errorURIs) {
      errorURIs.map((uri) => uri && tracker(uri, {errorCode}))
    }
  })
}

export default trackError
