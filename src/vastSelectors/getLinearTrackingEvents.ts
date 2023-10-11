import {get, getAll, getText, getAttributes} from '../xml'
import {ParsedAd, ParsedXML, VastTrackingEvent} from '../types'
import parseOffset from './helpers/parseOffset'
import getLinearCreative from './helpers/getLinearCreative'

const getTrackingEvent = (
  trackingEventElement: ParsedXML
): VastTrackingEvent => {
  const {event, offset} = getAttributes(trackingEventElement)
  const uri = getText(trackingEventElement)

  return {
    event,
    offset: offset && parseOffset(offset),
    uri
  }
}

/**
 * Gets the Linear tracking events from the Vast Ad
 *
 * @param ad VAST ad object.
 * @param eventName If provided it will filter-out the array events against it.
 * @returns Array of Tracking event definitions
 */
const getLinearTrackingEvents = (
  ad: ParsedAd,
  eventName?: string
): Optional<VastTrackingEvent[]> => {
  const creativeElement = ad && getLinearCreative(ad)
  const linearElement = creativeElement && get(creativeElement, 'Linear')
  const trackingEventsElement =
    linearElement && get(linearElement, 'TrackingEvents')
  const trackingEventElements =
    trackingEventsElement && getAll(trackingEventsElement, 'Tracking')

  if (trackingEventElements && trackingEventElements.length > 0) {
    const trackingEvents = trackingEventElements.map(getTrackingEvent)

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

export default getLinearTrackingEvents
