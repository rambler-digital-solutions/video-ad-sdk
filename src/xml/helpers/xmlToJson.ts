import {NodeType, ParsedXML, Attributes} from '../../types'

const getNodeType = (node: Node): NodeType => {
  switch (node.nodeType) {
    case 1:
      return NodeType.ELEMENT
    case 3:
    case 4:
      return NodeType.TEXT
    case 9:
      return NodeType.DOCUMENT
    default:
      throw new Error('Unsupported element type')
  }
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
    [1, 3, 4].includes(childNode.nodeType)
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

const xmlToJson = (node: Document | ChildNode): ParsedXML => {
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

export default xmlToJson
