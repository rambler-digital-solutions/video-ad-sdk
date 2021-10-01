import {VpaidCreativeAdUnit} from '../../../types'

const waitFor = (creativeAd: VpaidCreativeAdUnit, event: string, timeout?: number): Promise<void> => new Promise<void>((resolve, reject) => {
  // eslint-disable-next-line prefer-const
  let timeoutId: number;
  const handler = (): void => {
    if (typeof timeout === 'number') {
      clearTimeout(timeoutId);
    }

    creativeAd.unsubscribe(handler, event);
    resolve();
  };

  if (typeof timeout === 'number') {
    timeoutId = window.setTimeout(() => {
      creativeAd.unsubscribe(handler, event);
      reject(new Error(`Timeout waiting for event '${event}'`));
    }, timeout);
  }

  creativeAd.subscribe(handler, event);
});

export default waitFor;
