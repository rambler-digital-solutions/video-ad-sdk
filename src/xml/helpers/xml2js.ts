import saneError from 'sane-domparser-error'
import type {ParsedXML} from '../../types'
import {xmlToJson} from './xmlToJson'

export const xml2js = (parser: DOMParser, xmlText: string): ParsedXML => {
  const xmlDom = parser.parseFromString(xmlText, 'application/xml')

  saneError.failOnParseError(xmlDom)

  return xmlToJson(xmlDom)
}
