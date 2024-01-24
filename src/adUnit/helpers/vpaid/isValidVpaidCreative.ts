import type {VpaidCreativeAdUnit} from '../../../types'
import {METHODS} from './api'

export const isValidVpaidCreative = (
  creativeAd: VpaidCreativeAdUnit
): boolean =>
  METHODS.every((method) => typeof creativeAd[method] === 'function')
