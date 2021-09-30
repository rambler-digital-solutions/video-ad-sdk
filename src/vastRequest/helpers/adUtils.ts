import {ParsedAd} from '../../types';

const requested = Symbol('requested');

interface RequestableParsedAd extends ParsedAd {
  [requested]?: boolean;
}

export const markAdAsRequested = (ad: RequestableParsedAd): void => {
  ad[requested] = true;
};

export const unmarkAdAsRequested = (ad: RequestableParsedAd): void => {
  delete ad[requested];
};

export const hasAdBeenRequested = (ad: RequestableParsedAd): boolean =>
  Boolean(ad[requested]);
