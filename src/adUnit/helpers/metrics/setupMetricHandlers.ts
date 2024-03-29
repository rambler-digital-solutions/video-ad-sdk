import {getClickThrough, getSkipOffset} from '../../../vastSelectors'
import {VideoAdContainer} from '../../../adContainer'
import type {VastChain, Hooks, CancelFunction} from '../../../types'
import {getProgressEvents} from '../progress/getProgressEvents'
import {safeCallback} from '../safeCallback'
import {metricHandlers} from './handlers'

interface SetupMetricsHandlersOptions {
  vastChain: VastChain
  videoAdContainer: VideoAdContainer
  hooks: Hooks
  pauseOnAdClick: boolean
}

export const setupMetricHandlers = (
  {
    vastChain,
    videoAdContainer,
    hooks,
    pauseOnAdClick
  }: SetupMetricsHandlersOptions,
  callback: (event: string, ...args: any[]) => void
): CancelFunction => {
  const [{ad: inlineAd}] = vastChain
  const skipoffset = inlineAd && getSkipOffset(inlineAd)
  const clickThroughUrl = inlineAd && getClickThrough(inlineAd)
  const progressEvents = getProgressEvents(vastChain)
  const data = {
    clickThroughUrl,
    pauseOnAdClick,
    progressEvents,
    skipoffset,
    ...hooks
  }

  const stopHandlersFns = metricHandlers.map((handler) =>
    safeCallback(handler(videoAdContainer, callback, data))
  )

  return () => stopHandlersFns.forEach((disconnect) => disconnect())
}
