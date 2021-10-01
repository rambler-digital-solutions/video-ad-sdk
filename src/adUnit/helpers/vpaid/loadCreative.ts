import VideoAdContainer from '../../../adContainer/VideoAdContainer'
import {getInteractiveFiles} from '../../../vastSelectors';
import {VastChain, VpaidCreativeAdUnit, ExecutionContext} from '../../../types'
import isSupported from './isSupported';

const loadCreative = async (vastChain: VastChain, videoAdContainer: VideoAdContainer): Promise<VpaidCreativeAdUnit> => {
  const creative = (vastChain[0].ad && getInteractiveFiles(vastChain[0].ad) || []).filter(isSupported)[0];

  if (!creative || !creative.src) {
    throw new TypeError('VastChain does not contain a supported vpaid creative');
  }

  const {src, type} = creative;

  await videoAdContainer.addScript(src, {type});

  const context = videoAdContainer.executionContext as ExecutionContext

  return context.getVPAIDAd();
};

export default loadCreative;
