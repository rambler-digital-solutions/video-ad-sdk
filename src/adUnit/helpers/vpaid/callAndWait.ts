import {VpaidCreativeAdUnit} from '../../../types'
import waitFor from './waitFor'

const callAndWait = (
  creativeAd: VpaidCreativeAdUnit,
  method: keyof VpaidCreativeAdUnit,
  event: string,
  ...args: any[]
): Promise<void> => {
  const waitPromise = waitFor(creativeAd, event, 5000)
  const creativeMethod: any = creativeAd[method]

  creativeMethod?.apply(creativeAd, args)

  return waitPromise
}

export default callAndWait
