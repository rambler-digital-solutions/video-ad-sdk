import {VideoAdContainer} from '../../../adContainer'
import {getCreativeData} from '../../../vastSelectors'
import type {VpaidCreativeAdUnit, VastChain} from '../../../types'
import {viewmode} from './viewmode'

export const initAd = (
  creativeAd: VpaidCreativeAdUnit,
  videoAdContainer: VideoAdContainer,
  vastChain: VastChain
): void => {
  const {width, height} = videoAdContainer.element.getBoundingClientRect()
  const mode = viewmode(width, height)
  const desiredBitrate = -1
  const creativeData = getCreativeData(vastChain[0].XML as string)

  videoAdContainer.addSlot(width, height)

  const environmentVariables = {
    slot: videoAdContainer.slotElement,
    videoSlot: videoAdContainer.videoElement,
    videoSlotCanAutoPlay: videoAdContainer.isOriginalVideoElement
  }

  creativeAd.initAd(
    width,
    height,
    mode,
    desiredBitrate,
    creativeData,
    environmentVariables
  )
}
