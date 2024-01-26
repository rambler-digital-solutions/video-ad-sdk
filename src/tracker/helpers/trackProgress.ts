import type {VastChain, VastEventTrackerOptions} from '../../types'
import {pixelTracker} from './pixelTracker'

export const trackProgress = (
  _vastChain: VastChain,
  {data = {}, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  const {progressUri} = data

  if (progressUri) {
    tracker(progressUri, {...data})
  }
}
