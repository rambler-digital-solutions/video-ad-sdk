import {getLinearTrackingEvents} from '../../../vastSelectors'
import type {
  VastChain,
  VastResponse,
  VastTrackingEvent,
  ParsedAd
} from '../../../types'
import {linearEvents} from '../../../tracker'

const {progress} = linearEvents

export const getProgressEvents = (vastChain: VastChain): VastTrackingEvent[] =>
  vastChain
    .map(({ad}: VastResponse) => ad)
    .reduce((accumulated: VastTrackingEvent[], ad?: ParsedAd) => {
      const events = (ad && getLinearTrackingEvents(ad, progress)) || []

      return [...accumulated, ...events]
    }, [])
    .map(({offset, uri}: VastTrackingEvent) => ({
      offset,
      uri
    }))
