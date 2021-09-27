import {ParsedAd} from '../../types'

const requested = Symbol('requested');

interface RequestableParsedAd extends ParsedAd {
  [requested]?: boolean
}

export const markAdAsRequested = (ad: RequestableParsedAd) => {
  ad[requested] = true;
};

export const unmarkAdAsRequested = (ad: RequestableParsedAd) => {
  delete ad[requested];
};

export const hasAdBeenRequested = (ad: RequestableParsedAd) => Boolean(ad[requested]);
