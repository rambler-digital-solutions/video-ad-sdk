import {getNonLinearTrackingEvents} from '../vastSelectors'
import {ParsedAd, VastChain, VastEventTrackerOptions} from '../types'
import createVastEventTracker from './helpers/createVastEventTracker'
import pixelTracker from './helpers/pixelTracker'
import {acceptInvitation, adCollapse, close} from './nonLinearEvents'

const trackingEventSelector = (event: string) => (ad: ParsedAd) =>
  getNonLinearTrackingEvents(ad, event)

const linearTrackers = {
  [acceptInvitation]: createVastEventTracker(
    trackingEventSelector(acceptInvitation)
  ),
  [adCollapse]: createVastEventTracker(trackingEventSelector(adCollapse)),
  [close]: createVastEventTracker(trackingEventSelector(close))
}

/**
 * Tracks the passed non linear event.
 *
 * @param event name of the linear event we need to track. @see LinearEvents
 * @param vastChain the ad VAST Chain.
 * @param options Options Map.
 */
const trackNonLinearEvent = (
  event: keyof typeof linearTrackers,
  vastChain: VastChain,
  {data, tracker = pixelTracker, logger = console}: VastEventTrackerOptions
): void => {
  const linearTracker = linearTrackers[event]

  if (linearTracker) {
    linearTracker(vastChain, {
      data: {
        ...data
      },
      tracker
    })
  } else {
    logger.error(`Event '${event}' cannot be tracked`)
  }
}

export default trackNonLinearEvent
