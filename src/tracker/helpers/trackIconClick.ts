import type {VastChain, VastEventTrackerOptions} from '../../types'
import {pixelTracker} from './pixelTracker'

export const trackIconClick = (
  _vastChain: VastChain,
  {data = {}, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  const {iconClickTracking} = data

  if (Array.isArray(iconClickTracking)) {
    for (const trackUrl of iconClickTracking) {
      tracker(trackUrl, {...data})
    }
  }
}
