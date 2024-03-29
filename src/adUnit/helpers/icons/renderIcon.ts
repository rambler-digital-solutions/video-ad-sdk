import type {VastIcon, RenderedVastIcon} from '../../../types'
import {loadResource, type LoadResourceOptions} from '../resources/loadResource'
import {updateIcon} from './updateIcon'
import {canBeRendered} from './canBeRendered'

export interface RenderIconOptions extends LoadResourceOptions {
  drawnIcons: RenderedVastIcon[]
  onIconClick?(icon: VastIcon): void
}

const noop = (): void => {}

const wrapWithClickThrough = (
  iconElement: HTMLElement,
  icon: VastIcon,
  {onIconClick = noop}: Pick<RenderIconOptions, 'onIconClick'> = {}
): HTMLAnchorElement => {
  const anchor = document.createElement('a')

  if (icon.iconClickThrough) {
    anchor.href = icon.iconClickThrough
    anchor.target = '_blank'
  }

  // NOTE: if iframe icon disable pointer events so that clickThrough and click tracking work
  if (icon.iFrameResource) {
    iconElement.style.pointerEvents = 'none'
  }

  anchor.onclick = (event) => {
    if (Event.prototype.stopPropagation !== undefined) {
      event.stopPropagation()
    }

    onIconClick(icon)
  }

  anchor.appendChild(iconElement)

  return anchor
}

const createIcon = async (
  icon: VastIcon,
  options: RenderIconOptions
): Promise<HTMLAnchorElement> => {
  if (!icon.element) {
    const iconResource = await loadResource(icon, options)

    if (
      iconResource instanceof HTMLIFrameElement ||
      iconResource instanceof HTMLImageElement
    ) {
      iconResource.width = '100%'
      iconResource.height = '100%'
    }

    iconResource.style.height = '100%'
    iconResource.style.width = '100%'

    icon.element = wrapWithClickThrough(iconResource, icon, options)
  }

  return icon.element
}

const updateIconElement = (
  iconElement: HTMLAnchorElement,
  icon: RenderedVastIcon
): HTMLElement => {
  const {height, width, left, top, yPosition} = icon

  iconElement.style.position = 'absolute'
  iconElement.style.left = `${left}px`

  // NOTE: This if is a bit odd but some browser don't calculate the placeholder height pixel perfect and,
  //       setting the top of the icon will change the size of the icon's placeholder this if prevents that situation
  if (yPosition === 'bottom') {
    iconElement.style.bottom = '0'
  } else {
    iconElement.style.top = `${top}px`
  }

  iconElement.style.height = `${height}px`
  iconElement.style.width = `${width}px`

  return iconElement
}

export const renderIcon = async (
  icon: VastIcon,
  config: RenderIconOptions
): Promise<RenderedVastIcon> => {
  const {placeholder} = config
  const iconElement = await createIcon(icon, config)
  const updatedIcon = updateIcon(icon, iconElement, config)

  if (canBeRendered(updatedIcon, config)) {
    if (!iconElement.parentNode || updatedIcon.updated) {
      placeholder.appendChild(updateIconElement(iconElement, updatedIcon))
    }
  } else {
    iconElement.parentNode?.removeChild(iconElement)

    throw new Error("Icon can't be rendered")
  }

  return updatedIcon
}
