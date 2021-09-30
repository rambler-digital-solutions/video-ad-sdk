import {get, getFirstChild, getText, getAttribute} from '../xml';
import {ParsedXML, ParsedAd, VastChain, VastChainDetails} from '../types';
import getLinearCreative from '../vastSelectors/helpers/getLinearCreative';
import {
  isInline,
  getClickThrough,
  getCreativeData,
  isWrapper,
  getMediaFiles,
  getInteractiveFiles
} from '../vastSelectors';
import parseTime from '../vastSelectors/helpers/parseTime';

const getAdSystem = (ad: ParsedAd): string | null => {
  const adTypeElement = getFirstChild(ad);
  const element = adTypeElement && get(adTypeElement, 'AdSystem');

  if (element) {
    return getText(element);
  }

  return null;
};

const getSubElementValue = (
  parentElement: ParsedXML,
  tagName: string
): string | null => {
  const element = parentElement && get(parentElement, tagName);

  if (element) {
    return getText(element);
  }

  return null;
};

const getPricingElement = (ad: ParsedAd): ParsedXML | null => {
  const adTypeElement = getFirstChild(ad);

  return adTypeElement && get(adTypeElement, 'Pricing');
};

interface Pricing {
  pricing?: string | null;
  pricingCurrency?: string | null;
  pricingModel?: string | null;
}

const getPricing = (vastChain: VastChain): Pricing => {
  const {ad} = vastChain[0];
  const pricingElement = ad && getPricingElement(ad);

  if (pricingElement) {
    return {
      pricing: getText(pricingElement),
      pricingCurrency: getAttribute(pricingElement, 'currency'),
      pricingModel: getAttribute(pricingElement, 'model')
    };
  }

  if (vastChain.length > 1) {
    return getPricing(vastChain.slice(1));
  }

  return {};
};

interface Category {
  category?: string | null;
  categoryAuthority?: string | null;
}

const getCategory = (ad: ParsedAd): Category => {
  const inLineElement = get(ad, 'InLine');
  const categoryElement = inLineElement && get(inLineElement, 'Category');

  if (categoryElement) {
    return {
      category: getText(categoryElement),
      categoryAuthority: getAttribute(categoryElement, 'authority')
    };
  }

  return {};
};

const getVastVersion = (parsedVast: ParsedXML): string | null => {
  const vastElement = parsedVast && get(parsedVast, 'VAST');

  if (vastElement) {
    return getAttribute(vastElement, 'version');
  }

  return 'unknown';
};

/**
 * Returns a summary of the passed {@link VastChain}.
 *
 * @param vastChain the {@link VastChain} from which we want the details.
 * @returns Returns a {@link VastChainDetails} object from the passed {@link VastChain}.
 */
const getDetails = (vastChain: VastChain): VastChainDetails => {
  const adIds = vastChain
    .map(({ad}) => ad && getAttribute(ad, 'id'))
    .filter(Boolean);
  const adSystems = vastChain
    .map(({ad}) => ad && getAdSystem(ad))
    .filter(Boolean);
  const creatives = vastChain
    .map(({ad}) => ad && getLinearCreative(ad))
    .filter(Boolean);
  const creativeIds = creatives
    .map((creative) => creative && getAttribute(creative, 'id'))
    .filter(Boolean);
  const creativeAdIds = creatives
    .map((creative) => creative && getAttribute(creative, 'adId'))
    .filter(Boolean);
  const {ad, parsedXML, XML} = vastChain[0];
  const {pricing, pricingCurrency, pricingModel} = getPricing(vastChain);
  const {category, categoryAuthority} = ad ? getCategory(ad) : ({} as Category);
  const adTypeElement = ad && getFirstChild(ad);
  const creativeElement = ad && getLinearCreative(ad);
  const linearElement = creativeElement && get(creativeElement, 'Linear');
  const adServingId =
    adTypeElement && getSubElementValue(adTypeElement, 'AdServingId');
  const vastVersion = parsedXML && getVastVersion(parsedXML);
  const advertiser =
    adTypeElement && getSubElementValue(adTypeElement, 'Advertiser');
  const adTitle = adTypeElement && getSubElementValue(adTypeElement, 'AdTitle');
  const description =
    adTypeElement && getSubElementValue(adTypeElement, 'Description');
  const duration =
    linearElement && getSubElementValue(linearElement, 'Duration');
  const durationInMs = duration ? parseTime(duration) : null;
  let adId;
  let adWrapperIds;
  let adSystem;
  let adWrapperSystems;
  let creativeId;
  let adWrapperCreativeIds;
  let creativeAdId;
  let adWrapperCreativeAdIds;
  let clickThroughUrl;
  let creativeData;
  let universalAdId;
  let universalAdIdRegistry;
  let mediaFiles;
  let vpaid;
  let skippable;
  let skipOffset;
  let skipOffsetInMs;

  if (isInline(ad)) {
    [adId, ...adWrapperIds] = adIds;
    [adSystem, ...adWrapperSystems] = adSystems;
    [creativeId, ...adWrapperCreativeIds] = creativeIds;
    [creativeAdId, ...adWrapperCreativeAdIds] = creativeAdIds;

    clickThroughUrl = ad && getClickThrough(ad);
    creativeData = XML ? getCreativeData(XML) : null;
    const universalIdElement =
      creativeElement && get(creativeElement, 'UniversalAdId');

    universalAdId = universalIdElement && getText(universalIdElement);
    universalAdIdRegistry =
      universalIdElement && getAttribute(universalIdElement, 'idRegistry');
    mediaFiles = (ad && getMediaFiles(ad)) || [];
    vpaid = Boolean(ad && getInteractiveFiles(ad));
    skipOffset = linearElement && getAttribute(linearElement, 'skipoffset');
    skipOffsetInMs = skipOffset ? parseTime(skipOffset) : null;
    skippable = Boolean(skipOffset);
  } else if (isWrapper(vastChain[0].ad)) {
    adWrapperIds = adIds;
    adWrapperSystems = adSystems;
    adWrapperCreativeIds = creativeIds;
    adWrapperCreativeAdIds = creativeAdIds;
    mediaFiles = [];
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
  };
};

export default getDetails;
