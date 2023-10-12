import {hasAdPod, getAds, getPodAdSequence, isPodAd} from '../../vastSelectors'
import {ParsedAd, VastResponse, Optional} from '../../types'
import {RequestNextAdOptions} from '../../vastRequest'
import {hasAdBeenRequested} from './adUtils'

const getNextPod = (
  currentPod: ParsedAd,
  ads: ParsedAd[]
): Optional<ParsedAd> => {
  const nextPodSequence = (getPodAdSequence(currentPod) || 0) + 1

  return ads.find((ad) => getPodAdSequence(ad) === nextPodSequence)
}

const getNextAd = (
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
      nextAd = availableAds.filter((adDefinition) => !isPodAd(adDefinition))[0]
    }

    if (ad && !nextAd) {
      nextAd = getNextPod(ad, availableAds)
    }
  } else if (availableAds.length > 0 && fallbackOnNoAd) {
    nextAd = availableAds[0]
  }

  return nextAd
}

export default getNextAd
