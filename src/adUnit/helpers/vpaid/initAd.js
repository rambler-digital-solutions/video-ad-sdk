import {getCreativeData} from '../../../vastSelectors';
import viewmode from './viewmode';

const initAd = (creativeAd, videoAdContainer, vastChain) => {
  const {width, height} = videoAdContainer.element.getBoundingClientRect();
  const mode = viewmode(width, height);
  const desiredBitrate = -1;
  const creativeData = getCreativeData(vastChain[0].XML);

  videoAdContainer.addSlot(width, height);

  const environmentVars = {
    slot: videoAdContainer.slotElement,
    videoSlot: videoAdContainer.videoElement,
    videoSlotCanAutoPlay: videoAdContainer.isOriginalVideoElement
  };

  creativeAd.initAd(width, height, mode, desiredBitrate, creativeData, environmentVars);
};

export default initAd;
