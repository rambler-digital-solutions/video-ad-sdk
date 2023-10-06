import {VideoAdContainer} from '../../../../adContainer'
import {
  MetricHandlerData,
  Cancel,
  VastTrackingEvent,
  ParsedOffset
} from '../../../../types'
import {linearEvents} from '../../../../tracker'
import formatProgress from '../../progress/formatProgress'

const {progress} = linearEvents
const secondsToMilliseconds = (seconds: number): number => seconds * 1000
const isPercentage = (offset: string): boolean => {
  const percentageRegex = /^\d+(\.\d+)?%$/g

  return percentageRegex.test(offset) && !isNaN(parseFloat(offset))
}

const isValid = ({offset, uri}: VastTrackingEvent): boolean => {
  const offsetIsValid =
    typeof offset === 'number' || Boolean(offset && isPercentage(offset))
  const uriIsValid = typeof uri === 'string' && uri.length > 0

  return offsetIsValid && uriIsValid
}

const offsetToMs = (offset: ParsedOffset, durationInMs: number): number => {
  if (typeof offset === 'number') {
    return offset
  }

  return (parseFloat(offset) / 100) * durationInMs
}

interface ProgressData {
  contentplayhead: string
  progressUri?: string | null
}

interface PendingEvents {
  stillPending: VastTrackingEvent[]
  toCall: VastTrackingEvent[]
}

const onProgress = (
  {videoElement}: VideoAdContainer,
  callback: (event: string, data: ProgressData) => void,
  {progressEvents = []}: MetricHandlerData = {}
): Cancel => {
  const {duration} = videoElement
  const durationInMs = secondsToMilliseconds(duration)
  let playedMs = 0
  let previousCurrentTime = secondsToMilliseconds(videoElement.currentTime)
  let pendingEvents = progressEvents
    .filter(isValid)
    .map<VastTrackingEvent>(({offset, uri}) => ({
      offset: offsetToMs(offset as ParsedOffset, durationInMs),
      uri
    }))

  const progressHandler = (): void => {
    const {currentTime} = videoElement
    const delta = Math.abs(currentTime - previousCurrentTime)

    playedMs += secondsToMilliseconds(delta)
    previousCurrentTime = currentTime

    const {stillPending, toCall} = pendingEvents.reduce<PendingEvents>(
      (accumulator, event) => {
        const {offset} = event

        if (offset && playedMs >= offset) {
          accumulator.toCall.push(event)
        } else {
          accumulator.stillPending.push(event)
        }

        return accumulator
      },
      {
        stillPending: [],
        toCall: []
      }
    )

    pendingEvents = stillPending
    toCall.forEach(({uri}) => {
      callback(progress, {
        contentplayhead: formatProgress(playedMs),
        progressUri: uri
      })
    })

    if (pendingEvents.length === 0) {
      videoElement.removeEventListener('timeupdate', progressHandler)
    }
  }

  if (pendingEvents.length > 0) {
    videoElement.addEventListener('timeupdate', progressHandler)
  }

  return () => {
    videoElement.removeEventListener('timeupdate', progressHandler)
  }
}

export default onProgress
