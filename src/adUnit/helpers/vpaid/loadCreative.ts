import {VideoAdContainer} from '../../../adContainer'
import {getInteractiveFiles} from '../../../vastSelectors'
import type {
  VastChain,
  VpaidCreativeAdUnit,
  ExecutionContext
} from '../../../types'
import {isSupported} from './isSupported'

export const loadCreative = async (
  vastChain: VastChain,
  videoAdContainer: VideoAdContainer
): Promise<VpaidCreativeAdUnit> => {
  const interactiveFiles =
    (vastChain[0].ad && getInteractiveFiles(vastChain[0].ad)) || []
  const creative = interactiveFiles.find(isSupported)

  if (!creative || !creative.src) {
    throw new TypeError('VastChain does not contain a supported vpaid creative')
  }

  const {src: source, type} = creative

  await videoAdContainer.addScript(source, {type})

  const context = videoAdContainer.executionContext as ExecutionContext

  return context.getVPAIDAd()
}
