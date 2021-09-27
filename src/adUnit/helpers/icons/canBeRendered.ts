import {VastIcon} from '../../../types';
import {RenderIconOptions} from './renderIcon';

const calculateArea = ({height, width}: VastIcon): number => height * width;

export type CanBeRenderedOptions = Pick<
  RenderIconOptions,
  'drawnIcons' | 'placeholder'
>;

export const hasSpace = (
  newIcon: VastIcon,
  config: CanBeRenderedOptions
): boolean => {
  const {drawnIcons, placeholder} = config;
  const placeholderArea = calculateArea(placeholder.getBoundingClientRect());
  const iconArea = calculateArea(newIcon);
  const usedIconsArea = drawnIcons.reduce<number>(
    (accumulator, icon) => accumulator + calculateArea(icon),
    0
  );

  return iconArea + usedIconsArea <= placeholderArea * 0.35;
};

export const withinBoundaries = (
  newIcon: VastIcon,
  {placeholder}: CanBeRenderedOptions
): boolean => {
  const phRect = placeholder.getBoundingClientRect();

  return (
    newIcon.left >= 0 &&
    newIcon.left + newIcon.width <= phRect.width &&
    newIcon.top >= 0 &&
    newIcon.top + newIcon.height <= phRect.height
  );
};

const right = ({left, width}: VastIcon): number => left + width;
const left = ({left}: VastIcon): number => left;
const top = ({top}: VastIcon): number => top;
const bottom = ({top, height}: VastIcon): number => top + height;

const overlap = (newIcon: VastIcon, drawnIcon: VastIcon): boolean => {
  if (
    left(newIcon) > right(drawnIcon) ||
    right(newIcon) < left(drawnIcon) ||
    bottom(newIcon) < top(drawnIcon) ||
    top(newIcon) > bottom(drawnIcon)
  ) {
    return false;
  }

  return true;
};

export const withoutOverlaps = (
  newIcon: VastIcon,
  {drawnIcons}: CanBeRenderedOptions
): boolean => !drawnIcons.some((drawnIcon) => overlap(newIcon, drawnIcon));

const canBeRendered = (
  newIcon: VastIcon,
  config: CanBeRenderedOptions
): boolean => {
  const thereIsSpace = hasSpace(newIcon, config);
  const isWithinTheContentArea = withinBoundaries(newIcon, config);
  const doesNotOverlap = withoutOverlaps(newIcon, config);

  return thereIsSpace && isWithinTheContentArea && doesNotOverlap;
};

export default canBeRendered;
