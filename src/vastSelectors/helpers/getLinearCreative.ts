import {get, getAll, getFirstChild} from '../../xml'
import {ParsedAd, ParsedXML} from '../../types'

const hasLinear = (creative: ParsedXML): Optional<ParsedXML> =>
  get(creative, 'linear')

const getLinearCreative = (ad: ParsedAd): Optional<ParsedXML> => {
  const adTypeElement = getFirstChild(ad)
  const creativesElement = adTypeElement && get(adTypeElement, 'creatives')

  return creativesElement && getAll(creativesElement).find(hasLinear)
}

export default getLinearCreative
