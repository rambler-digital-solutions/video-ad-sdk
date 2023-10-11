import {getAdErrorURI, getVastErrorURI} from '../../../vastSelectors'
import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  wrapperParsedXML,
  wrapperAd
} from '../../../../fixtures'
import {ErrorCode} from '../../errorCode'
import {VastChain} from '../../../types'
import pixelTracker from '../pixelTracker'
import trackError from '../trackError'

jest.mock('../pixelTracker', () => jest.fn())

afterEach(() => {
  ;(pixelTracker as jest.Mock).mockClear()
})

const vastChain: VastChain = [
  {
    ad: undefined,
    error: expect.any(Error),
    errorCode: ErrorCode.VAST_UNEXPECTED_MEDIA_FILE,
    parsedXML: noAdParsedXML,
    requestTag: 'https://test.example.com/vastadtaguri',
    XML: vastNoAdXML
  },
  {
    ad: wrapperAd,
    parsedXML: wrapperParsedXML,
    requestTag: 'http://adtag.test.example.com',
    XML: vastWrapperXML
  }
]

test('trackError must track the errors using pixelTracker fn', () => {
  const errorURI = [
    ...getVastErrorURI(noAdParsedXML) as string[],
    ...getAdErrorURI(wrapperAd) as string[]
  ]

  trackError(vastChain, {errorCode: vastChain[0].errorCode})

  expect(pixelTracker).toHaveBeenCalledTimes(3)
  errorURI.map((uri) =>
    expect(pixelTracker).toHaveBeenCalledWith(uri, {errorCode: 203})
  )
})

test('trackError must accept an optional track function', () => {
  const mockTrack = jest.fn()
  const errorURI = [
    ...getVastErrorURI(noAdParsedXML) as string[],
    ...getAdErrorURI(wrapperAd) as string[]
  ]

  trackError(vastChain, {
    errorCode: vastChain[0].errorCode,
    tracker: mockTrack
  })

  expect(pixelTracker).not.toHaveBeenCalled()
  expect(mockTrack).toHaveBeenCalledTimes(3)
  errorURI.map((uri) =>
    expect(mockTrack).toHaveBeenCalledWith(uri, {errorCode: 203})
  )
})
