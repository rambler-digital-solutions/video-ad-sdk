export const enum NodeType {
  CDATA = 'cdata',
  DOCUMENT = 'document',
  ELEMENT = 'element',
  TEXT = 'text'
};

export type Attributes = Record<string, string | null>

export interface ParsedXML {
  type: NodeType
  name?: string
  text?: string
  elements?: ParsedXML[]
  attributes?: Attributes
}

