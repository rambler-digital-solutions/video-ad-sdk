import {VpaidCreativeAdUnit} from '../../../types'
import waitFor from './waitFor';

type ArgumentsType<T> = T extends  (...args: infer U) => any ? U: never;

const callAndWait = <T extends keyof VpaidCreativeAdUnit>(creativeAd: VpaidCreativeAdUnit, method: T, event: string, ...args: ArgumentsType<VpaidCreativeAdUnit[T]>): Promise<void> => {
  const waitPromise = waitFor(creativeAd, event, 5000);

  creativeAd[method](...args);

  return waitPromise;
};

export default callAndWait;
