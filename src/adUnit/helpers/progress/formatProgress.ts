import {toFixedDigits} from './toFixedDigits'

const TIME_NUMBERS = 2
const MS_NUMBERS = 3

export const formatProgress = (progress: number): string => {
  const hours = Math.floor(progress / (60 * 60 * 1000))
  const minutes = Math.floor((progress / (60 * 1000)) % 60)
  const seconds = Math.floor((progress / 1000) % 60)
  const ms = progress % 1000

  return `${toFixedDigits(hours, TIME_NUMBERS)}:${toFixedDigits(
    minutes,
    TIME_NUMBERS
  )}:${toFixedDigits(seconds, TIME_NUMBERS)}.${toFixedDigits(ms, MS_NUMBERS)}`
}
