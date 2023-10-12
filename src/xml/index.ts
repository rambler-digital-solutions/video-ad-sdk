import xml2js from './helpers/xml2js'
import {ParsedXML} from '../types'
import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from './helpers/xmlSelectors'

const parser = new DOMParser()

/**
 * Parses the passed xml text.
 *
 * @throws if there is an error parsing the xml.
 * @param xmlText XML text to be parsed.
 * @returns Returns the parsed xml document as a js object.
 */
export const parseXml = (xmlText: string): ParsedXML => xml2js(parser, xmlText)

export {get, getAll, getFirstChild, getText, getAttributes, getAttribute}
