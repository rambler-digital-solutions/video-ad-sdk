import {getLinearTrackingEvents, VastChain, VastTrackingEvent} from '../../../vastSelectors';
import {linearEvents} from '../../../tracker';

const {
  progress
} = linearEvents;

const getProgressEvents = (vastChain: VastChain): VastTrackingEvent[] => vastChain.map(({ad}) => ad)
  .reduce((accumulated: VastTrackingEvent[], ad) => {
    const events = ad && getLinearTrackingEvents(ad, progress) || [];

    return [
      ...accumulated,
      ...events
    ];
  }, [])
  .map(({offset, uri}) => ({
    offset,
    uri
  }));

export default getProgressEvents;
