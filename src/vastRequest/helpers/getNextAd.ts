import {
  hasAdPod,
  getAds,
  getPodAdSequence,
  isPodAd,
  ParsedAd,
  VastResponse
} from '../../vastSelectors';
import {RequestNextAdOptions} from '../types';
import {hasAdBeenRequested} from './adUtils';

const getNextPod = (currentPod: ParsedAd, ads: ParsedAd[]): ParsedAd | null => {
  const nextPodSequence = (getPodAdSequence(currentPod) || 0) + 1;

  return ads.find((ad) => getPodAdSequence(ad) === nextPodSequence) || null;
};

const getNextAd = (
  {ad, parsedXML}: VastResponse,
  {fallbackOnNoAd = true, useAdBuffet = false}: RequestNextAdOptions
): ParsedAd | null => {
  const ads = getAds(parsedXML);
  const availableAds = ads.filter(
    (adDefinition) => !hasAdBeenRequested(adDefinition)
  );
  let nextAd = null;

  if (hasAdPod(parsedXML)) {
    if (useAdBuffet) {
      nextAd = availableAds.filter((adDefinition) => !isPodAd(adDefinition))[0];
    }

    if (ad && !nextAd) {
      nextAd = getNextPod(ad, availableAds);
    }
  } else if (availableAds.length > 0 && fallbackOnNoAd) {
    nextAd = availableAds[0];
  }

  return nextAd;
};

export default getNextAd;
