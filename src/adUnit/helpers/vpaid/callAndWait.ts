import type {VpaidCreativeAdUnit} from '../../../types'
import {waitFor} from './waitFor'

const WAIT_TIMEOUT = 5000

export const callAndWait = (
  creativeAd: VpaidCreativeAdUnit,
  method: keyof VpaidCreativeAdUnit,
  event: string,
  ...args: any[]
  // eslint-disable-next-line max-params
): Promise<void> => {
  const waitPromise = waitFor(creativeAd, event, WAIT_TIMEOUT)
  const creativeMethod: any = creativeAd[method]

  creativeMethod?.apply(creativeAd, args)

  return waitPromise
}
