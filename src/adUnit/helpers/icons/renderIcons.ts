import {VastIcon} from '../../../types';
import {VideoAdContainer} from '../../../adContainer';
import renderIcon from './renderIcon';
import canBeShown from './canBeShown';

interface RenderIconsOptions {
  videoAdContainer: VideoAdContainer;
  logger: Console;
  onIconClick?(icon: VastIcon): void;
}

const renderIcons = (
  icons: VastIcon[],
  {onIconClick, videoAdContainer, logger}: RenderIconsOptions
): Promise<VastIcon[]> => {
  const {element, videoElement} = videoAdContainer;
  const drawnIcons: VastIcon[] = [];

  const {iconsToShow, otherIcons} = icons.reduce<{
    iconsToShow: VastIcon[];
    otherIcons: VastIcon[];
  }>(
    (accumulator, icon) => {
      if (canBeShown(icon, videoElement)) {
        accumulator.iconsToShow.push(icon);
      } else {
        accumulator.otherIcons.push(icon);
      }

      return accumulator;
    },
    {
      iconsToShow: [],
      otherIcons: []
    }
  );

  otherIcons.forEach(({element: iconElement}) => {
    iconElement?.parentNode?.removeChild(iconElement);
  });

  return iconsToShow
    .reduce<Promise<void>>(
      (promise, icon: VastIcon) =>
        promise
          .then(() =>
            renderIcon(icon, {
              document,
              drawnIcons,
              onIconClick,
              placeholder: element
            })
          )
          .then((renderedIcon) => {
            drawnIcons.push(renderedIcon);
          })
          .catch((error) => logger.log(error)),
      Promise.resolve()
    )
    .then(() => drawnIcons);
};

export default renderIcons;
