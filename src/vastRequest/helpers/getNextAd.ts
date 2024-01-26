import {hasAdPod, getAds, getPodAdSequence, isPodAd} from '../../vastSelectors'
import type {ParsedAd, VastResponse, Optional} from '../../types'
import type {RequestNextAdOptions} from '..'
import {hasAdBeenRequested} from './adUtils'

const getNextPod = (
  currentPod: ParsedAd,
  ads: ParsedAd[]
): Optional<ParsedAd> => {
  const nextPodSequence = (getPodAdSequence(currentPod) || 0) + 1

  return ads.find((ad) => getPodAdSequence(ad) === nextPodSequence)
}

export const getNextAd = (
  {ad, parsedXML}: VastResponse,
  {fallbackOnNoAd = true, useAdBuffet = false}: RequestNextAdOptions
): Optional<ParsedAd> => {
  const ads = getAds(parsedXML)
  const availableAds = ads.filter(
    (adDefinition) => !hasAdBeenRequested(adDefinition)
  )
  let nextAd

  if (hasAdPod(parsedXML)) {
    if (useAdBuffet) {
      nextAd = availableAds.find((adDefinition) => !isPodAd(adDefinition))
    }

    if (ad && !nextAd) {
      nextAd = getNextPod(ad, availableAds)
    }
  } else if (availableAds.length > 0 && fallbackOnNoAd) {
    const [availableAd] = availableAds

    nextAd = availableAd
  }

  return nextAd
}
