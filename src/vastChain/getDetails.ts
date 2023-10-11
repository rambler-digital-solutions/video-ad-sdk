import {get, getFirstChild, getText, getAttribute} from '../xml'
import {ParsedXML, ParsedAd, VastChain, VastChainDetails, MediaFile} from '../types'
import getLinearCreative from '../vastSelectors/helpers/getLinearCreative'
import {
  isInline,
  getClickThrough,
  getCreativeData,
  isWrapper,
  getMediaFiles,
  getInteractiveFiles
} from '../vastSelectors'
import parseTime from '../vastSelectors/helpers/parseTime'

const getAdSystem = (ad: ParsedAd): Optional<string> => {
  const adTypeElement = getFirstChild(ad)
  const element = adTypeElement && get(adTypeElement, 'AdSystem')

  return element && getText(element)
}

const getSubElementValue = (
  parentElement: ParsedXML,
  tagName: string
): Optional<string> => {
  const element = parentElement && get(parentElement, tagName)

  return element && getText(element)
}

const getPricingElement = (ad: ParsedAd): Optional<ParsedXML> => {
  const adTypeElement = getFirstChild(ad)

  return adTypeElement && get(adTypeElement, 'Pricing')
}

interface Pricing {
  pricing?: string
  pricingCurrency?: string
  pricingModel?: string
}

const getPricing = (vastChain: VastChain): Pricing => {
  const {ad} = vastChain[0]
  const pricingElement = ad && getPricingElement(ad)

  if (pricingElement) {
    return {
      pricing: getText(pricingElement),
      pricingCurrency: getAttribute(pricingElement, 'currency'),
      pricingModel: getAttribute(pricingElement, 'model')
    }
  }

  if (vastChain.length > 1) {
    return getPricing(vastChain.slice(1))
  }

  return {}
}

interface Category {
  category?: string
  categoryAuthority?: string
}

const getCategory = (ad?: ParsedAd): Category => {
  const inLineElement = ad && get(ad, 'InLine')
  const categoryElement = inLineElement && get(inLineElement, 'Category')

  if (categoryElement) {
    return {
      category: getText(categoryElement),
      categoryAuthority: getAttribute(categoryElement, 'authority')
    }
  }

  return {}
}

const getVastVersion = (parsedVast?: ParsedXML): Optional<string> => {
  const vastElement = parsedVast && get(parsedVast, 'VAST')

  if (vastElement) {
    return getAttribute(vastElement, 'version')
  }

  return 'unknown'
}

const getAdIds = (vastChain: VastChain): string[] =>
  vastChain.map(({ad}) => ad && getAttribute(ad, 'id')).filter(Boolean)

const getAdSystems = (vastChain: VastChain): string[] =>
  vastChain.map(({ad}) => ad && getAdSystem(ad)).filter(Boolean)

const getCreatives = (vastChain: VastChain): ParsedXML[] =>
  vastChain.map(({ad}) => ad && getLinearCreative(ad)).filter(Boolean)

const getCreativeIds = (creatives: ParsedXML[]): string[] =>
  creatives
    .map((creative) => creative && getAttribute(creative, 'id'))
    .filter(Boolean)

const getCreativeAdIds = (creatives: ParsedXML[]): string[] =>
  creatives
    .map((creative) => creative && getAttribute(creative, 'adId'))
    .filter(Boolean)

const getAdTypeElement = (ad?: ParsedXML): Optional<ParsedXML> =>
  ad && getFirstChild(ad)

const getCreativeElement = (ad?: ParsedXML): Optional<ParsedXML> =>
  ad && getLinearCreative(ad)

const getLinearElement = (
  creativeElement?: ParsedXML
): Optional<ParsedXML> => creativeElement && get(creativeElement, 'Linear')

const getAdServingId = (adTypeElement?: ParsedXML): Optional<string> =>
  adTypeElement && getSubElementValue(adTypeElement, 'AdServingId')

const getAdvertiser = (adTypeElement?: ParsedXML): Optional<string> =>
  adTypeElement && getSubElementValue(adTypeElement, 'Advertiser')

const getAdTitle = (adTypeElement?: ParsedXML): Optional<string> =>
  adTypeElement && getSubElementValue(adTypeElement, 'AdTitle')

const getDescription = (adTypeElement?: ParsedXML): Optional<string> =>
  adTypeElement && getSubElementValue(adTypeElement, 'Description')

const getDuration = (linearElement?: ParsedXML): Optional<string> =>
  linearElement && getSubElementValue(linearElement, 'Duration')

const getDurationInMs = (duration?: string): Optional<number> =>
  duration ? parseTime(duration) : undefined

const getUniversalIdElement = (
  creativeElement?: ParsedXML
): Optional<ParsedXML> => creativeElement && get(creativeElement, 'UniversalAdId')

/**
 * Returns a summary of the passed {@link VastChain}.
 *
 * @param vastChain the {@link VastChain} from which we want the details.
 * @returns Returns a {@link VastChainDetails} object from the passed {@link VastChain}.
 */
const getDetails = (vastChain: VastChain): VastChainDetails => {
  const adIds = getAdIds(vastChain)
  const adSystems = getAdSystems(vastChain)
  const creatives = getCreatives(vastChain)
  const creativeIds = getCreativeIds(creatives)
  const creativeAdIds = getCreativeAdIds(creatives)

  const {ad, parsedXML, XML} = vastChain[0]
  const {pricing, pricingCurrency, pricingModel} = getPricing(vastChain)
  const {category, categoryAuthority} = getCategory(ad)

  const adTypeElement = getAdTypeElement(ad)
  const creativeElement = getCreativeElement(ad)
  const linearElement = getLinearElement(creativeElement)
  const adServingId = getAdServingId(adTypeElement)
  const vastVersion = getVastVersion(parsedXML)
  const advertiser = getAdvertiser(adTypeElement)
  const adTitle = getAdTitle(adTypeElement)
  const description = getDescription(adTypeElement)
  const duration = getDuration(linearElement)
  const durationInMs = getDurationInMs(duration)

  let adId
  let adWrapperIds: string[] = []
  let adSystem
  let adWrapperSystems: string[] = []
  let creativeId
  let adWrapperCreativeIds: string[] = []
  let creativeAdId
  let adWrapperCreativeAdIds: string[] = []
  let clickThroughUrl
  let creativeData
  let universalAdId
  let universalAdIdRegistry
  let mediaFiles: MediaFile[] = []
  let vpaid
  let skippable
  let skipOffset
  let skipOffsetInMs

  if (isInline(ad)) {
    ;[adId, ...adWrapperIds] = adIds
    ;[adSystem, ...adWrapperSystems] = adSystems
    ;[creativeId, ...adWrapperCreativeIds] = creativeIds
    ;[creativeAdId, ...adWrapperCreativeAdIds] = creativeAdIds

    clickThroughUrl = ad && getClickThrough(ad)
    creativeData = XML ? getCreativeData(XML) : undefined

    const universalIdElement = getUniversalIdElement(creativeElement)

    universalAdId = universalIdElement && getText(universalIdElement)
    universalAdIdRegistry =
      universalIdElement && getAttribute(universalIdElement, 'idRegistry')
    mediaFiles = ad && getMediaFiles(ad) || []
    vpaid = Boolean(ad && getInteractiveFiles(ad))
    skipOffset = linearElement && getAttribute(linearElement, 'skipoffset')
    skipOffsetInMs = skipOffset ? parseTime(skipOffset) : undefined
    skippable = Boolean(skipOffset)
  } else if (isWrapper(vastChain[0].ad)) {
    adWrapperIds = adIds
    adWrapperSystems = adSystems
    adWrapperCreativeIds = creativeIds
    adWrapperCreativeAdIds = creativeAdIds
  }

  return {
    adId,
    adServingId,
    adSystem,
    adTitle,
    advertiser,
    adWrapperCreativeAdIds,
    adWrapperCreativeIds,
    adWrapperIds,
    adWrapperSystems,
    category,
    categoryAuthority,
    clickThroughUrl,
    creativeAdId,
    creativeData,
    creativeId,
    description,
    duration,
    durationInMs,
    mediaFiles,
    pricing,
    pricingCurrency,
    pricingModel,
    skipOffset,
    skipOffsetInMs,
    skippable,
    universalAdId,
    universalAdIdRegistry,
    vastVersion,
    vpaid
  }
}

export default getDetails
