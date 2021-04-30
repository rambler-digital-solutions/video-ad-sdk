import {
  get,
  getAll,
  getText,
  getAttributes,
  ParsedXML
} from '../xml';
import parseOffset from './helpers/parseOffset';
import getLinearCreative from './helpers/getLinearCreative';
import {ParsedAd, VastTrackingEvent} from './types'

/**
 * Gets the Linear tracking events from the Vast Ad
 *
 * @param ad VAST ad object.
 * @param eventName If provided it will filter-out the array events against it.
 * @returns Array of Tracking event definitions
 */
const getLinearTrackingEvents = (ad: ParsedAd, eventName?: string): VastTrackingEvent[] | null => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const linearElement = get(creativeElement, 'Linear');
    const trackingEventsElement = linearElement && get(linearElement, 'TrackingEvents');
    const trackingEventElements = trackingEventsElement && getAll(trackingEventsElement, 'Tracking');

    if (trackingEventElements && trackingEventElements.length > 0) {
      const trackingEvents = trackingEventElements.map((trackingEventElement) => {
        const {event, offset} = getAttributes(trackingEventElement);
        const uri = getText(trackingEventElement);

        return {
          event,
          offset: offset && parseOffset(offset),
          uri
        };
      });

      if (eventName) {
        const filteredEvents = trackingEvents.filter(({event}) => event === eventName);

        if (filteredEvents.length > 0) {
          return filteredEvents;
        }
      } else {
        return trackingEvents;
      }
    }
  }

  return null;
};

export default getLinearTrackingEvents;
