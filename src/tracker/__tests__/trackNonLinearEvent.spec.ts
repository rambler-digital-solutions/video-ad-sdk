import {getFirstAd} from '../../vastSelectors'
import {
  wrapperParsedXML,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML,
  vastPodXML
} from '../../../fixtures'
import trackNonLinearEvent from '../trackNonLinearEvent'
import {acceptInvitation, adCollapse, close} from '../nonLinearEvents'
import {VastChain} from '../../types'
import pixelTracker from '../helpers/pixelTracker'

jest.mock('../helpers/pixelTracker', () => jest.fn())

describe('trackNonLinearEvent', () => {
  const vastChain: VastChain = [
    {
      ad: vpaidInlineAd,
      parsedXML: vpaidInlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastVpaidInlineXML
    },
    {
      ad: getFirstAd(wrapperParsedXML),
      parsedXML: wrapperParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastPodXML
    }
  ]

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test('must log an error if it gets an unknown event', () => {
    const logger: any = {
      error: jest.fn()
    }

    trackNonLinearEvent('UNKNOWN' as any, vastChain, {
      data: {},
      logger
    })

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      "Event 'UNKNOWN' cannot be tracked"
    )
  })

  test('must use pixelTracker by default', () => {
    const data = {}

    trackNonLinearEvent(acceptInvitation, vastChain, {
      data
    })

    expect(pixelTracker).toHaveBeenCalledTimes(1)
    expect(pixelTracker).toHaveBeenCalledWith(
      'https://test.example.com/vpaid/acceptInvitation',
      data
    )
  })
  ;[acceptInvitation, adCollapse, close].forEach((event) => {
    test(`must track ${event} linear event with the default pixelTracker`, () => {
      const data = {}
      const tracker = jest.fn()

      trackNonLinearEvent(event as any, vastChain, {
        data,
        tracker
      })

      expect(tracker).toHaveBeenCalledWith(
        `https://test.example.com/vpaid/${event}`,
        {}
      )
    })
  })
})
