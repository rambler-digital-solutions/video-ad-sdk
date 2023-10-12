import {get, getAll, getText, getAttributes} from '../xml'
import {ParsedAd, VastTrackingEvent, Optional} from '../types'
import getLinearCreative from './helpers/getLinearCreative'

/**
 * Gets the Non Linear tracking events from the Vast Ad
 *
 * @param ad VAST ad object.
 * @param eventName If provided it will filter-out the array events against it.
 * @returns Array of Tracking event definitions
 */
const getNonLinearTrackingEvents = (
  ad: ParsedAd,
  eventName?: string
): Optional<VastTrackingEvent[]> => {
  const creativeElement = ad && getLinearCreative(ad)
  const nonLinearAdsElement =
    creativeElement && get(creativeElement, 'NonLinearAds')
  const trackingEventsElement =
    nonLinearAdsElement && get(nonLinearAdsElement, 'TrackingEvents')
  const trackingEventElements =
    trackingEventsElement && getAll(trackingEventsElement, 'Tracking')

  if (trackingEventElements && trackingEventElements.length > 0) {
    const trackingEvents = trackingEventElements.map((trackingEventElement) => {
      const {event} = getAttributes(trackingEventElement)
      const uri = getText(trackingEventElement)

      return {
        event,
        uri
      }
    })

    if (!eventName) {
      return trackingEvents
    }

    const filteredEvents = trackingEvents.filter(
      ({event}) => event === eventName
    )

    if (filteredEvents.length > 0) {
      return filteredEvents
    }
  }
}

export default getNonLinearTrackingEvents
