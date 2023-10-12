import {RenderedVastIcon} from '../../../types'
import {RenderIconOptions} from './renderIcon'

const calculateArea = ({
  height,
  width
}: Pick<DOMRect, 'width' | 'height'>): number => height * width

export type CanBeRenderedOptions = Pick<
  RenderIconOptions,
  'drawnIcons' | 'placeholder'
>

export const hasSpace = (
  newIcon: RenderedVastIcon,
  config: CanBeRenderedOptions
): boolean => {
  const {drawnIcons, placeholder} = config
  const placeholderArea = calculateArea(placeholder.getBoundingClientRect())
  const iconArea = calculateArea(newIcon)
  const usedIconsArea = drawnIcons.reduce<number>((accumulator, icon) => {
    const {width, height} = icon

    if (!width || !height) {
      return accumulator
    }

    return accumulator + calculateArea({width, height})
  }, 0)

  return iconArea + usedIconsArea <= placeholderArea * 0.35
}

export const withinBoundaries = (
  newIcon: RenderedVastIcon,
  {placeholder}: CanBeRenderedOptions
): boolean => {
  const phRect = placeholder.getBoundingClientRect()

  return (
    newIcon.left >= 0 &&
    newIcon.left + newIcon.width <= phRect.width &&
    newIcon.top >= 0 &&
    newIcon.top + newIcon.height <= phRect.height
  )
}

const right = ({left, width}: RenderedVastIcon): number => left + width
const left = ({left}: RenderedVastIcon): number => left
const top = ({top}: RenderedVastIcon): number => top
const bottom = ({top, height}: RenderedVastIcon): number => top + height

const overlap = (
  newIcon: RenderedVastIcon,
  drawnIcon: RenderedVastIcon
): boolean =>
  left(newIcon) <= right(drawnIcon) &&
  right(newIcon) >= left(drawnIcon) &&
  bottom(newIcon) >= top(drawnIcon) &&
  top(newIcon) <= bottom(drawnIcon)

export const withoutOverlaps = (
  newIcon: RenderedVastIcon,
  {drawnIcons}: CanBeRenderedOptions
): boolean => !drawnIcons.some((drawnIcon) => overlap(newIcon, drawnIcon))

const canBeRendered = (
  newIcon: RenderedVastIcon,
  config: CanBeRenderedOptions
): boolean => {
  const thereIsSpace = hasSpace(newIcon, config)
  const isWithinTheContentArea = withinBoundaries(newIcon, config)
  const doesNotOverlap = withoutOverlaps(newIcon, config)

  return thereIsSpace && isWithinTheContentArea && doesNotOverlap
}

export default canBeRendered
