import {VideoAdContainer} from '../../../adContainer'
import {getCreativeData} from '../../../vastSelectors';
import {VpaidCreativeAdUnit, VastChain} from '../../../types'
import viewmode from './viewmode';

const createSlot = (placeholder: HTMLElement, width: number, height: number): HTMLDivElement => {
  const slot = document.createElement('div');

  Object.assign(slot.style, {
    border: '0px',
    cursor: 'pointer',
    height: `${height}px`,
    left: '0px',
    margin: '0px',
    padding: '0px',
    position: 'absolute',
    top: '0px',
    width: `${width}px`
  });

  placeholder.appendChild(slot);

  return slot;
};

const initAd = (creativeAd: VpaidCreativeAdUnit, videoAdContainer: VideoAdContainer, vastChain: VastChain): void => {
  const placeholder = videoAdContainer.element;
  const {width, height} = placeholder.getBoundingClientRect();
  const mode = viewmode(width, height);
  const desiredBitrate = -1;
  const creativeData = vastChain[0].XML ? getCreativeData(vastChain[0].XML) : undefined;

  const environmentVars = {
    slot: createSlot(placeholder, width, height),
    videoSlot: videoAdContainer.videoElement,
    videoSlotCanAutoPlay: videoAdContainer.isOriginalVideoElement
  };

  creativeAd.initAd(width, height, mode, desiredBitrate, creativeData, environmentVars);
};

export default initAd;
