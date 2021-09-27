import {get, getAll, getFirstChild} from '../../xml';
import {ParsedAd, ParsedXML} from '../../types'

const getLinearCreative = (ad: ParsedAd) => {
  const adTypeElement = getFirstChild(ad);
  const creativesElement = adTypeElement && get(adTypeElement, 'creatives');
  const hasLinear = (creative: ParsedXML) => get(creative, 'linear');

  return creativesElement && getAll(creativesElement).find(hasLinear) || null;
};

export default getLinearCreative;
