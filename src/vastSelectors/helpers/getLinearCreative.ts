import {get, getAll, getFirstChild} from '../../xml'
import {ParsedAd, ParsedXML} from '../../types'

const hasLinear = (creative: ParsedXML): ParsedXML | null =>
  get(creative, 'linear')

const getLinearCreative = (ad: ParsedAd): ParsedXML | null => {
  const adTypeElement = getFirstChild(ad)
  const creativesElement = adTypeElement && get(adTypeElement, 'creatives')

  return (creativesElement && getAll(creativesElement).find(hasLinear)) || null
}

export default getLinearCreative
