import {
  linearEvents,
  nonLinearEvents,
  trackLinearEvent,
  trackNonLinearEvent
} from '../tracker'
import {VastChain, VastEventTrackerOptions} from '../types'
import {VideoAdContainer} from '../adContainer'
import VastAdUnit from './VastAdUnit'
import VpaidAdUnit from './VpaidAdUnit'

interface VideoAdUnitOptions<T extends string> extends VastEventTrackerOptions {
  type: T
}

function createVideoAdUnit(
  vastChain: VastChain,
  videoAdContainer: VideoAdContainer,
  options: VideoAdUnitOptions<'VPAID'>
): VpaidAdUnit

function createVideoAdUnit(
  vastChain: VastChain,
  videoAdContainer: VideoAdContainer,
  options: VideoAdUnitOptions<string>
): VastAdUnit

function createVideoAdUnit(
  vastChain: VastChain,
  videoAdContainer: VideoAdContainer,
  options: VideoAdUnitOptions<string>
): VpaidAdUnit | VastAdUnit {
  const {tracker, type} = options
  const adUnit =
    type === 'VPAID'
      ? new VpaidAdUnit(vastChain, videoAdContainer, options)
      : new VastAdUnit(vastChain, videoAdContainer, options)

  Object.values(linearEvents).forEach((linearEvent) =>
    adUnit.on(linearEvent, (event) => {
      const {type: evtType, data} = event
      const payload = {
        data,
        errorCode: adUnit.errorCode,
        tracker
      }

      trackLinearEvent(evtType, vastChain, payload)
    })
  )

  Object.values(nonLinearEvents).forEach((nonLinearEvent) =>
    adUnit.on(nonLinearEvent, (event) => {
      const payload = {
        data: event.data,
        tracker
      }

      trackNonLinearEvent(event.type, vastChain, payload)
    })
  )

  return adUnit
}

export default createVideoAdUnit
