import type {Optional} from '../../types'

const parseHoursToMs = (hourString: string): number =>
  Number(hourString) * 60 * 60 * 1000
const parseMinToMs = (minString: string): number =>
  Number(minString) * 60 * 1000
const parseSecToMs = (secString: string): number => Number(secString) * 1000

export const parseTime = (durationString: string): Optional<number> => {
  if (typeof durationString === 'string') {
    const durationRegex = /(\d\d):(\d\d):(\d\d)(\.(\d\d\d))?/
    const match = durationString.match(durationRegex)

    if (match) {
      const [, hours, minutes, seconds, , ms] = match

      const durationInMs =
        parseHoursToMs(hours) +
        parseMinToMs(minutes) +
        parseSecToMs(seconds) +
        (ms ? Number(ms) : 0)

      if (!isNaN(durationInMs)) {
        return durationInMs
      }
    }
  }
}
