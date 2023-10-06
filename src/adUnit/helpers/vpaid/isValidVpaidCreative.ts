import {VpaidCreativeAdUnit} from '../../../types'
import {METHODS} from './api'

const isValidVpaidCreative = (creativeAd: VpaidCreativeAdUnit): boolean =>
  METHODS.every((method) => typeof creativeAd[method] === 'function')

export default isValidVpaidCreative
