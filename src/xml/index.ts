import xml2js from './helpers/xml2js';
import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from './helpers/xmlSelectors';
import {Attributes, NodeType, ParsedXML} from './types';

const parser = new DOMParser();

/**
 * Parses the passed xml text.
 *
 * @throws if there is an error parsing the xml.
 * @param xmlText XML text to be parsed.
 * @returns Returns the parsed xml document as a js object.
 */
export const parseXml = (xmlText: string) => xml2js(parser, xmlText);

export {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute,
  Attributes,
  NodeType,
  ParsedXML
};
