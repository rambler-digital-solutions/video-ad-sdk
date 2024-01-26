import {NodeType} from '../../types'
import type {ParsedXML, Attributes, Optional} from '../../types'

const NODE_TYPE: Record<number, NodeType> = {
  1: NodeType.ELEMENT,
  3: NodeType.TEXT,
  4: NodeType.TEXT
}

const DOCUMENT_TYPE: Record<number, NodeType> = {
  9: NodeType.DOCUMENT
}

const getNodeType = (node: Node): NodeType => {
  const nodeType = NODE_TYPE[node.nodeType] ?? DOCUMENT_TYPE[node.nodeType]

  if (!nodeType) {
    throw new Error('Unsupported element type')
  }

  return nodeType
}

const getNodeAttributes = (node: Element): Optional<Attributes> =>
  node.attributes.length === 0
    ? undefined
    : Object.fromEntries(
        Array.from(node.attributes).map((attribute) => [
          attribute.nodeName,
          attribute.nodeValue ?? undefined
        ])
      )

const getNodeText = (node: Text | CDATASection): Optional<string> =>
  node.nodeValue?.replace('<![CDATA[', '').replace(']]>', '').trim()

const getNodeChildren = (node: Document | ChildNode): Optional<ParsedXML[]> => {
  if (!node.hasChildNodes()) {
    return
  }

  const childNodes = Array.from(node.childNodes).filter((childNode) =>
    Object.keys(NODE_TYPE).map(Number).includes(childNode.nodeType)
  )

  const elements: ParsedXML[] = []

  for (const childNode of childNodes) {
    const childElement = xmlToJson(childNode)

    if (!(childNode instanceof Text) || (childElement.text?.length ?? 0) > 0) {
      elements.push(childElement)
    }
  }

  return elements
}

export const xmlToJson = (node: Document | ChildNode): ParsedXML => {
  const type = getNodeType(node)

  const element: ParsedXML = {
    type
  }

  if (node instanceof Element) {
    const attributes = getNodeAttributes(node)

    if (attributes) {
      element.attributes = attributes
    }

    element.name = node.nodeName.toLowerCase()
  } else if (node instanceof Text || node instanceof CDATASection) {
    element.text = getNodeText(node)
  }

  const children = getNodeChildren(node)

  if (children) {
    element.elements = children
  }

  return element
}
