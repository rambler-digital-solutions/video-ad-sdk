import saneError from 'sane-domparser-error'
import {ParsedXML} from '../../types'
import xmlToJson from './xmlToJson'

const xml2js = (parser: DOMParser, xmlText: string): ParsedXML => {
  const xmlDom = parser.parseFromString(xmlText, 'application/xml')

  saneError.failOnParseError(xmlDom)

  return xmlToJson(xmlDom)
}

export default xml2js
