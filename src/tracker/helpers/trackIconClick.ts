import {VastChain, VastEventTrackerOptions} from '../../types'
import pixelTracker from './pixelTracker'

const trackIconClick = (
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

export default trackIconClick
