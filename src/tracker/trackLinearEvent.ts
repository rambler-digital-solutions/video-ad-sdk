import {
  getClickTracking,
  getCustomClick,
  getImpression,
  getViewable,
  getNotViewable,
  getViewUndetermined,
  getLinearTrackingEvents,
} from '../vastSelectors';
import {
  ParsedAd,
  VastChain,
  VastTrackingEvent,
  VastEventTrackerOptions
} from '../types';
import pixelTracker from './helpers/pixelTracker';
import trackError from './helpers/trackError';
import trackIconView from './helpers/trackIconView';
import trackIconClick from './helpers/trackIconClick';
import trackProgress from './helpers/trackProgress';
import createVastEventTracker from './helpers/createVastEventTracker';
import {
  clickThrough,
  closeLinear,
  complete,
  error,
  exitFullscreen,
  firstQuartile,
  fullscreen,
  iconClick,
  iconView,
  impression,
  viewable,
  notViewable,
  viewUndetermined,
  midpoint,
  mute,
  pause,
  playerCollapse,
  playerExpand,
  progress,
  resume,
  rewind,
  skip,
  start,
  thirdQuartile,
  unmute,
  creativeView
} from './linearEvents';

type TrackingEventSelector = (ad: ParsedAd) => string[] | null;

const eventSelector =
  (...selectors: TrackingEventSelector[]) =>
  (ad: ParsedAd) => {
    const trackingURIs: VastTrackingEvent[] = [];

    if (selectors.length > 0) {
      selectors.forEach((getElements) => {
        const elements = getElements(ad);

        /* istanbul ignore else */
        if (Array.isArray(elements) && elements.length > 0) {
          trackingURIs.push(...elements.map((uri) => ({uri})));
        }
      });
    }

    return trackingURIs;
  };

const linearTrackingEventSelector = (event: string) => (ad: ParsedAd) =>
  getLinearTrackingEvents(ad, event);

const linearTrackers = {
  [clickThrough]: createVastEventTracker(
    eventSelector(getClickTracking, getCustomClick)
  ),
  [closeLinear]: createVastEventTracker(
    linearTrackingEventSelector(closeLinear)
  ),
  [complete]: createVastEventTracker(linearTrackingEventSelector(complete)),
  [creativeView]: createVastEventTracker(
    linearTrackingEventSelector(creativeView)
  ),
  [error]: trackError,
  [exitFullscreen]: createVastEventTracker(
    linearTrackingEventSelector(exitFullscreen)
  ),
  [firstQuartile]: createVastEventTracker(
    linearTrackingEventSelector(firstQuartile)
  ),
  [fullscreen]: createVastEventTracker(linearTrackingEventSelector(fullscreen)),
  [iconClick]: trackIconClick,
  [iconView]: trackIconView,
  [impression]: createVastEventTracker(eventSelector(getImpression)),
  [midpoint]: createVastEventTracker(linearTrackingEventSelector(midpoint)),
  [mute]: createVastEventTracker(linearTrackingEventSelector(mute)),
  [notViewable]: createVastEventTracker(eventSelector(getNotViewable)),
  [pause]: createVastEventTracker(linearTrackingEventSelector(pause)),
  [playerCollapse]: createVastEventTracker(
    linearTrackingEventSelector(playerCollapse)
  ),
  [playerExpand]: createVastEventTracker(
    linearTrackingEventSelector(playerExpand)
  ),
  [progress]: trackProgress,
  [resume]: createVastEventTracker(linearTrackingEventSelector(resume)),
  [rewind]: createVastEventTracker(linearTrackingEventSelector(rewind)),
  [skip]: createVastEventTracker(linearTrackingEventSelector(skip)),
  [start]: createVastEventTracker(linearTrackingEventSelector(start)),
  [thirdQuartile]: createVastEventTracker(
    linearTrackingEventSelector(thirdQuartile)
  ),
  [unmute]: createVastEventTracker(linearTrackingEventSelector(unmute)),
  [viewable]: createVastEventTracker(eventSelector(getViewable)),
  [viewUndetermined]: createVastEventTracker(eventSelector(getViewUndetermined))
};

/**
 * Tracks the passed linear event.
 *
 * @param event name of the linear event we need to track. @see LinearEvents
 * @param vastChain the ad VAST Chain.
 * @param options Options Map. The allowed properties are:
 */
const trackLinearEvent = (
  event: keyof typeof linearTrackers,
  vastChain: VastChain,
  {
    data,
    errorCode,
    tracker = pixelTracker,
    logger = console
  }: VastEventTrackerOptions
): void => {
  const linearTracker = linearTrackers[event];

  if (linearTracker) {
    linearTracker(vastChain, {
      data: {
        ...data,
        errorCode
      },
      errorCode,
      tracker
    });
  } else {
    logger.error(`Event '${event}' cannot be tracked`);
  }
};

export default trackLinearEvent;
