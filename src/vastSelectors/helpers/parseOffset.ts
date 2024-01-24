import type {Optional} from '../../types'
import {parseTime} from './parseTime'

const isPercentage = (offset: string): boolean => {
  const percentageRegex = /^\d+(\.\d+)?%$/g

  return percentageRegex.test(offset)
}

// eslint-disable-next-line sonar/function-return-type
export const parseOffset = (offset: string): Optional<string | number> => {
  if (isPercentage(offset)) {
    return offset
  }

  return parseTime(offset)
}
