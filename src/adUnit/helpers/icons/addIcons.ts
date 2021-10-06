import {VideoAdContainer} from '../../../adContainer';
import {VastIcon as BaseIcon} from '../../../types';
import renderIcons from './renderIcons';

const firstRenderPending = Symbol('firstRenderPending');

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

interface VastIcon extends BaseIcon {
  [firstRenderPending]?: boolean;
}

const hasPendingIconRedraws = (
  icons: VastIcon[],
  videoElement: HTMLVideoElement
): boolean => {
  const currentTimeInMs = videoElement.currentTime * 1000;
  const videoDurationInMs = videoElement.duration * 1000;

  const iconsPendingToRedraw = icons.filter(
    (icon) => !icon.offset || icon.offset < currentTimeInMs
  );
  const iconsPendingToBeRemoved = icons.filter(
    (icon) => icon.duration && icon.duration < videoDurationInMs
  );

  return iconsPendingToRedraw.length > 0 || iconsPendingToBeRemoved.length > 0;
};

const removeDrawnIcons = (icons: VastIcon[]): void =>
  icons
    .filter(({element}) => Boolean(element?.parentNode))
    .forEach(({element}) => element?.parentNode?.removeChild(element));

export interface AddIconsOptions {
  videoAdContainer: VideoAdContainer;
  onIconView?(icon: VastIcon): void;
  onIconClick?(icon: VastIcon): void;
  logger?: Console;
}

export interface AddedIcons {
  drawIcons(): Promise<void>;
  hasPendingIconRedraws(): boolean;
  removeIcons(): void;
}

const addIcons = (
  icons: VastIcon[],
  {
    videoAdContainer,
    onIconView = noop,
    onIconClick = noop,
    ...rest
  }: AddIconsOptions
): AddedIcons => {
  const {videoElement, element} = videoAdContainer;
  const drawIcons = async (): Promise<void> => {
    const drawnIcons = await renderIcons(icons, {
      onIconClick,
      videoAdContainer,
      ...rest
    });

    element.dispatchEvent(new CustomEvent('iconsDrawn'));

    drawnIcons.forEach((icon: VastIcon) => {
      if (icon[firstRenderPending]) {
        onIconView(icon);
        icon[firstRenderPending] = false;
      }
    });
  };

  icons.forEach((icon) => {
    icon[firstRenderPending] = true;
  });

  return {
    drawIcons,
    hasPendingIconRedraws: () => hasPendingIconRedraws(icons, videoElement),
    removeIcons: () => removeDrawnIcons(icons)
  };
};

export default addIcons;
