import {get, getAll, getFirstChild} from '../../xml'
import type {ParsedAd, ParsedXML, Optional} from '../../types'

const hasLinear = (creative: ParsedXML): Optional<ParsedXML> =>
  get(creative, 'linear')

export const getLinearCreative = (ad: ParsedAd): Optional<ParsedXML> => {
  const adTypeElement = getFirstChild(ad)
  const creativesElement = adTypeElement && get(adTypeElement, 'creatives')

  return creativesElement && getAll(creativesElement).find(hasLinear)
}
