import {VideoAdContainer} from '../../../../adContainer'
import type {CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'
import {adProgress} from '../../../adUnitEvents'

const {complete, firstQuartile, midpoint, start, thirdQuartile} = linearEvents

const FIRST_QUARTILE = 25
const MID_POINT = 50
const THIRD_QUARTILE = 75
const COMPLETED = 99
const PERCENTAGE_FACTOR = 100

const percentageProgress = (currentTime: number, duration: number): number =>
  (currentTime * PERCENTAGE_FACTOR) / duration
const isPassFirstQuartile = (currentTime: number, duration: number): boolean =>
  percentageProgress(currentTime, duration) >= FIRST_QUARTILE
const isPassMidPoint = (currentTime: number, duration: number): boolean =>
  percentageProgress(currentTime, duration) >= MID_POINT
const isPassThirdQuartile = (currentTime: number, duration: number): boolean =>
  percentageProgress(currentTime, duration) >= THIRD_QUARTILE
const isCompleted = (currentTime: number, duration: number): boolean =>
  percentageProgress(currentTime, duration) >= COMPLETED

interface TimeUpdateEvent {
  isFired: (currentTime: number, duration: number) => boolean
  callback: () => void
}

// TODO: implement logic to track `timeSpentViewing` linear event

export const onTimeUpdate = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): CancelFunction => {
  let started = false
  let passFirstQuartile = false
  let passMidPoint = false
  let passThirdQuartile = false
  let completed = false

  const events: Record<string, TimeUpdateEvent> = {
    start: {
      isFired: (currentTime) => !started && currentTime > 0,
      callback: () => {
        started = true
        callback(start)
      }
    },
    firstQuartile: {
      isFired: (currentTime, duration) =>
        !passFirstQuartile && isPassFirstQuartile(currentTime, duration),
      callback: () => {
        passFirstQuartile = true
        callback(firstQuartile)
      }
    },
    midpoint: {
      isFired: (currentTime, duration) =>
        !passMidPoint && isPassMidPoint(currentTime, duration),
      callback: () => {
        passMidPoint = true
        callback(midpoint)
      }
    },
    thirdQuartile: {
      isFired: (currentTime, duration) =>
        !passThirdQuartile && isPassThirdQuartile(currentTime, duration),
      callback: () => {
        passThirdQuartile = true
        callback(thirdQuartile)
      }
    },
    complete: {
      isFired: (currentTime, duration) =>
        !completed && isCompleted(currentTime, duration),
      callback: () => {
        completed = true
        callback(complete)
      }
    }
  }

  const timeUpdateHandler = (): void => {
    const {duration} = videoElement
    const {currentTime} = videoElement

    for (const event in events) {
      if (events[event].isFired(currentTime, duration)) {
        events[event].callback()
        break
      }
    }

    callback(adProgress)
  }

  const endedHandler = (): void => {
    const {duration} = videoElement
    const {currentTime} = videoElement

    if (!completed && isCompleted(currentTime, duration)) {
      completed = true
      callback(complete)
    }

    videoElement.removeEventListener('ended', endedHandler)
    videoElement.removeEventListener('timeupdate', timeUpdateHandler)
  }

  videoElement.addEventListener('timeupdate', timeUpdateHandler)
  videoElement.addEventListener('ended', endedHandler)

  return () => {
    videoElement.removeEventListener('timeupdate', timeUpdateHandler)
    videoElement.removeEventListener('ended', endedHandler)
  }
}
