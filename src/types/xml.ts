/**
 * XML node type
 */
export enum NodeType {
  CDATA = 'cdata',
  DOCUMENT = 'document',
  ELEMENT = 'element',
  TEXT = 'text'
}

/**
 * XML attribute map
 */
export type Attributes = Partial<Record<string, string>>

/**
 * JS XML deserialised object.
 */
export interface ParsedXML {
  type: NodeType
  name?: string
  text?: string
  elements?: ParsedXML[]
  attributes?: Attributes
}
