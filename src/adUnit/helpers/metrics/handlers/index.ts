import {VideoAdContainer} from '../../../../adContainer'
import type {MetricHandlerData, CancelFunction} from '../../../../types'
import {onFullscreenChange} from './onFullscreenChange'
import {onPlayPause} from './onPlayPause'
import {onRewind} from './onRewind'
import {onSkip} from './onSkip'
import {onError} from './onError'
import {onTimeUpdate} from './onTimeUpdate'
import {onVolumeChange} from './onVolumeChange'
import {onImpression} from './onImpression'
import {onProgress} from './onProgress'
import {onClickThrough} from './onClickThrough'

type MetricHandler = (
  videoAdContainer: VideoAdContainer,
  callback: (event: string, ...args: any[]) => void,
  data: MetricHandlerData
) => CancelFunction

export const metricHandlers: MetricHandler[] = [
  onClickThrough,
  onError,
  onFullscreenChange,
  onImpression,
  onPlayPause,
  onProgress,
  onRewind,
  onSkip,
  onTimeUpdate,
  onVolumeChange
]
