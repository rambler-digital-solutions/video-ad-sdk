import {metricHandlers} from '../index'
import {onFullscreenChange} from '../onFullscreenChange'
import {onPlayPause} from '../onPlayPause'
import {onRewind} from '../onRewind'
import {onSkip} from '../onSkip'
import {onError} from '../onError'
import {onTimeUpdate} from '../onTimeUpdate'
import {onVolumeChange} from '../onVolumeChange'
import {onImpression} from '../onImpression'
import {onProgress} from '../onProgress'
import {onClickThrough} from '../onClickThrough'

test('metricHandlers must be an array', () => {
  expect(metricHandlers).toBeInstanceOf(Array)
})

test('metricHandlers must include all the metricHandlers', () => {
  expect(metricHandlers).toEqual([
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
  ])
})
