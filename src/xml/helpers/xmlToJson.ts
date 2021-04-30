import {Attributes, NodeType, ParsedXML} from '../types'

const nodeType = (node: Node): NodeType => {
  if (node.nodeType === 1) {
    return NodeType.ELEMENT;
  }

  if (node.nodeType === 3 || node.nodeType === 4) {
    return NodeType.TEXT;
  }

  if (node.nodeType === 9) {
    return NodeType.DOCUMENT;
  }

  throw new Error('Unsupported element type');
};

const xmlToJson = (node: Document | ChildNode) => {
  const type = nodeType(node);

  const element: ParsedXML = {
    type
  };

  if (node instanceof Element) {
    element.name = node.nodeName.toLowerCase();

    if (node.attributes.length > 0) {
      element.attributes = {};
      for (const attribute of Array.from(node.attributes)) {
        element.attributes[attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (node instanceof Text || node instanceof CDATASection) {
    element.text = node.nodeValue
      ?.replace('<![CDATA[', '')
      .replace(']]>', '')
      .trim();
  }

  // do children
  if (node.hasChildNodes()) {
    const childNodes = Array.from(node.childNodes).filter((childNode) => [1, 3, 4].includes(childNode.nodeType));
    const elements: ParsedXML[] = [];

    element.elements = elements;

    for (const childNode of childNodes) {
      const childElement = xmlToJson(childNode);

      if (!(childNode instanceof Text) || (childElement.text?.length ?? 0) > 0) {
        elements.push(childElement);
      }
    }
  }

  return element;
};

export default xmlToJson;
