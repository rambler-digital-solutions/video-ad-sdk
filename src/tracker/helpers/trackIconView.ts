import type {VastChain, VastEventTrackerOptions} from '../../types'
import {pixelTracker} from './pixelTracker'

export const trackIconView = (
  _vastChain: VastChain,
  {data = {}, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  const {iconViewTracking} = data

  if (Array.isArray(iconViewTracking)) {
    for (const trackUrl of iconViewTracking) {
      tracker(trackUrl, {...data})
    }
  }
}
