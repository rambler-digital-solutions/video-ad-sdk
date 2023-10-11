const parseHoursToMs = (hourStr: string): number =>
  parseInt(hourStr, 10) * 60 * 60 * 1000
const parseMinToMs = (minStr: string): number =>
  parseInt(minStr, 10) * 60 * 1000
const parseSecToMs = (secStr: string): number => parseInt(secStr, 10) * 1000

const parseTime = (durationStr: string): Optional<number> => {
  if (typeof durationStr === 'string') {
    const durationRegex = /(\d\d):(\d\d):(\d\d)(\.(\d\d\d))?/
    const match = durationStr.match(durationRegex)

    if (match) {
      const durationInMs =
        parseHoursToMs(match[1]) +
        parseMinToMs(match[2]) +
        parseSecToMs(match[3]) +
        (match[5] ? parseInt(match[5], 10) : 0)

      if (!isNaN(durationInMs)) {
        return durationInMs
      }
    }
  }
}

export default parseTime
