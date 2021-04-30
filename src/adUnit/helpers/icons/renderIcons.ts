import {VastIcon} from '../../../vastSelectors'
import {VideoAdContainer} from '../../../adContainer'
import renderIcon from './renderIcon';
import canBeShown from './canBeShown';

interface RenderIconsOptions {
  videoAdContainer?: VideoAdContainer
  onIconClick?(icon: VastIcon): void
  logger?: Console;
}

const renderIcons = (icons: VastIcon[], {onIconClick, videoAdContainer, logger}: RenderIconsOptions): Promise<VastIcon[]> => {
  const {
    element,
    videoElement
  } = videoAdContainer;
  const drawnIcons: VastIcon[] = [];
  const {
    iconsToShow,
    otherIcons
  } = icons.reduce((accumulator, icon) => {
    if (canBeShown(icon, videoElement)) {
      accumulator.iconsToShow.push(icon);
    } else {
      accumulator.otherIcons.push(icon);
    }

    return accumulator;
  }, {
    iconsToShow: [],
    otherIcons: []
  });

  otherIcons.forEach(({element: iconElement}) => {
    if (iconElement && iconElement.parentNode) {
      iconElement.parentNode.removeChild(iconElement);
    }
  });

  return iconsToShow
    .reduce((promise, icon) => promise
      .then(() => renderIcon(icon, {
        document,
        drawnIcons,
        onIconClick,
        placeholder: element
      }))
      .then((renderedIcon) => drawnIcons.push(renderedIcon))
      .catch((error) => logger.log(error))
    , Promise.resolve(drawnIcons))
    .then(() => drawnIcons);
};

export default renderIcons;
