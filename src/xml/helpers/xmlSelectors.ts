import type {ParsedXML, Attributes, Optional} from '../../types'

const getChildren = (element: ParsedXML): ParsedXML[] => element.elements ?? []

const findChildByName = (
  element: ParsedXML,
  childName: string
): Optional<ParsedXML> =>
  getChildren(element).find(
    ({name = ''}) => name.toUpperCase() === childName.toUpperCase()
  )

const filterChildrenByName = (
  element: ParsedXML,
  childrenName: string
): ParsedXML[] =>
  getChildren(element).filter(
    ({name = ''}) => name.toUpperCase() === childrenName.toUpperCase()
  )

/**
 * Get the first child element from the passed parsed xml element.
 *
 * @param element Parsed xml element object.
 * @param childName Child element name
 * @returns The first child element with the passed name or undefined if not found.
 */
export const get = findChildByName

/**
 * Get all the children elements of the passed parsed xml element filtered by the passed child name if passed.
 *
 * @param element Parsed xml element object.
 * @param childName Child element name.
 * @returns Array of child elements or an empty array.
 */
export const getAll = (element: ParsedXML, childName?: string): ParsedXML[] => {
  if (typeof childName === 'string') {
    return filterChildrenByName(element, childName)
  }

  return getChildren(element)
}

/**
 * Get the first child element from the passed parsed xml element.
 *
 * @returns The first child element or undefined if there are non.
 */
export const getFirstChild = (element: ParsedXML): Optional<ParsedXML> =>
  getChildren(element)[0]

/**
 * Get the text value of the passed parsed xml element.
 *
 * @returns Text of the element
 */
export const getText = (element?: ParsedXML): Optional<string> => {
  const firstChild = element && getFirstChild(element)

  return firstChild && firstChild.text
}

/**
 * Get all the attributes of the passed parsed xml element.
 *
 * @returns Object with the element attributes.
 */
export const getAttributes = (element: ParsedXML): Attributes =>
  element.attributes ?? {}

/**
 * Get the attribute with the passed name of the passed parsed xml element.
 *
 * @returns Attribute value or undefined.
 */
export const getAttribute = (
  element: ParsedXML,
  attributeName: string
): Optional<string> => getAttributes(element)[attributeName]
