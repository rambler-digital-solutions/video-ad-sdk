import {VastIcon as BaseIcon} from '../../../types';

interface VastIcon extends BaseIcon {
  updated?: boolean;
}

const isCustomXposition = (xPosition: string | number): boolean =>
  !['left', 'right'].includes(String(xPosition).toLowerCase());

const isCustomYPosition = (yPosition: string | number): boolean =>
  !['top', 'bottom'].includes(String(yPosition).toLowerCase());

const calculateIconLeft = (
  dynamicPos: string | number,
  iconWidth: number,
  drawnIcons: VastIcon[],
  phWidth: number
): number => {
  const drawnIconsWidth = drawnIcons.reduce(
    (accumulator, icon) => accumulator + icon.width + 1,
    0
  );

  if (dynamicPos === 'left') {
    return drawnIconsWidth;
  }

  return phWidth - drawnIconsWidth - iconWidth;
};

const calculateIconTop = (
  dynamicPos: string | number,
  iconHeight: number,
  phHeight: number
): number => {
  if (dynamicPos === 'top') {
    return 0;
  }

  return phHeight - iconHeight;
};

interface UpdateIconOptions {
  drawnIcons: VastIcon[];
  placeholder: HTMLElement;
}

const updateIcon = (
  icon: VastIcon,
  iconElement: HTMLElement,
  {drawnIcons, placeholder}: UpdateIconOptions
): VastIcon => {
  const oldSignature = icon.signature;
  const rect = iconElement.getBoundingClientRect();
  const phRect = placeholder.getBoundingClientRect();
  const width = icon.width || rect.width;
  const height = icon.height || rect.height;
  const xPosition = icon.xPosition || 'right';
  const yPosition = icon.yPosition || 'top';
  let left;
  let top;

  if (isCustomXposition(xPosition)) {
    left = xPosition;
  } else {
    const icons = drawnIcons.filter(
      (dIcon) => dIcon.xPosition === xPosition && dIcon.yPosition === yPosition
    );

    left = calculateIconLeft(xPosition, width, icons, phRect.width);
  }
  if (isCustomYPosition(yPosition)) {
    top = yPosition;
  } else {
    top = calculateIconTop(yPosition, height, phRect.height);
  }

  const signature = `${left}-${top}_${width}x${height}`;

  return Object.assign<VastIcon, VastIcon>(icon, {
    height,
    left,
    signature,
    top,
    updated: oldSignature !== signature,
    width
  });
};

export default updateIcon;
