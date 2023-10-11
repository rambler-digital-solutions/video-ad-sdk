import {get, getAll, getText, getAttributes} from '../xml'
import {ParsedAd, ParsedXML, VastIcon} from '../types'
import getLinearCreative from './helpers/getLinearCreative'
import parseTime from './helpers/parseTime'

const formatSize = (size: string | number): number => {
  const match = `${size}`.match(/\d+/g)

  return parseInt(match?.[0] || '', 10)
}

const formatPosition = (position: string): number | string => {
  const isNumberString = /\d+/.test(position)

  if (isNumberString) {
    return formatSize(position)
  }

  return position
}

const getIconAttributes = (iconElement: ParsedXML): VastIcon => {
  const {
    duration,
    height,
    offset,
    program,
    pxratio,
    width,
    xPosition = 'right',
    yPosition = 'top'
  } = getAttributes(iconElement)

  return {
    duration: duration && parseTime(duration) || undefined,
    height: height && formatSize(height) || undefined,
    offset: offset && parseTime(offset) || undefined,
    program,
    pxratio: pxratio && parseInt(pxratio, 10) || undefined,
    width: width && formatSize(width) || undefined,
    xPosition: xPosition && formatPosition(xPosition),
    yPosition: yPosition && formatPosition(yPosition)
  }
}

const getIconResource = (iconElement: ParsedXML): VastIcon => {
  const staticResourceElement = get(iconElement, 'StaticResource')
  const htmlResourceElement = get(iconElement, 'HTMLResource')
  const iFrameResourceElement = get(iconElement, 'IFrameResource')

  if (staticResourceElement) {
    return {staticResource: getText(staticResourceElement)}
  }

  if (htmlResourceElement) {
    return {htmlResource: getText(htmlResourceElement)}
  }

  if (iFrameResourceElement) {
    return {iFrameResource: getText(iFrameResourceElement)}
  }

  return {
    staticResource: getText(iconElement)
  }
}

const getIconViewTracking = (iconElement: ParsedXML): VastIcon => {
  const iconTrackingElements = getAll(iconElement, 'IconViewTracking')
    .map((iconViewTrackingElement) => getText(iconViewTrackingElement))
    .filter(Boolean)

  if (iconTrackingElements.length === 0) {
    return {}
  }

  return {
    iconViewTracking: iconTrackingElements
  }
}

const getIconClicks = (iconElement: ParsedXML): VastIcon => {
  const iconClicksElement = get(iconElement, 'IconClicks')
  const iconClickThroughElement =
    iconClicksElement && get(iconClicksElement, 'IconClickThrough')
  const iconClickTrackingElements =
    iconClicksElement &&
    getAll(iconClicksElement, 'IconClickTracking')
      .map((iconClickTrackingElement) => getText(iconClickTrackingElement))
      .filter(Boolean)

  return {
    iconClickThrough:
      iconClickThroughElement && getText(iconClickThroughElement),
    iconClickTracking:
      iconClickTrackingElements && iconClickTrackingElements.length > 0
        ? iconClickTrackingElements
        : undefined
  }
}

/**
 * Gets the Vast Icon definitions from the Vast Ad.
 *
 * @param ad VAST ad object.
 * @returns Array of VAST icon definitions
 */
const getIcons = (ad: ParsedAd): Optional<VastIcon[]> => {
  const linearCreativeElement = ad && getLinearCreative(ad)
  const linearElement =
    linearCreativeElement && get(linearCreativeElement, 'linear')
  const iconsElement = linearElement && get(linearElement, 'Icons')
  const iconElements = iconsElement && getAll(iconsElement, 'Icon')

  if (iconElements && iconElements.length > 0) {
    return iconElements.map((iconElement: ParsedXML) => ({
      ...getIconAttributes(iconElement),
      ...getIconResource(iconElement),
      ...getIconViewTracking(iconElement),
      ...getIconClicks(iconElement)
    }))
  }
}

export default getIcons
