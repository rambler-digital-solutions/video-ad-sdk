import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd,
  hybridInlineAd,
  hybridInlineParsedXML,
  hybridInlineXML,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../../fixtures'
import {createVideoAdUnit} from '../../../adUnit/createVideoAdUnit'
import {VastAdUnit, type VastAdUnitOptions} from '../../../adUnit/VastAdUnit'
import {VpaidAdUnit, type VpaidAdUnitOptions} from '../../../adUnit/VpaidAdUnit'
import {canPlay} from '../../../adUnit/helpers/media/canPlay'
import {VideoAdContainer} from '../../../adContainer/VideoAdContainer'
import {startVideoAd} from '../startVideoAd'
import {ErrorCode} from '../../../tracker'
import type {VastChain} from '../../../types'
import {start, closeLinear} from '../../../tracker/linearEvents'
import {adStopped, adUserClose} from '../../../adUnit/helpers/vpaid/api'

jest.mock('../../../adUnit/createVideoAdUnit')
jest.mock('../../../adUnit/helpers/media/canPlay')

const createAdUnitMock = (
  adChain: VastChain,
  adContainer: VideoAdContainer,
  options: VastAdUnitOptions
): VastAdUnit => {
  const vastAdUnit = new VastAdUnit(adChain, adContainer, options)
  const errorCallbacks: any[] = []

  vastAdUnit.onError = (handler: any): void => {
    errorCallbacks.push(handler)
  }

  vastAdUnit.cancel = jest.fn()

  ;(vastAdUnit as any).__simulateError = (error: Error): void => {
    errorCallbacks.forEach((handler) => handler(error))
  }

  return vastAdUnit
}

const createVPAIDAdUnitMock = (
  adChain: VastChain,
  adContainer: VideoAdContainer,
  options: VpaidAdUnitOptions
): VpaidAdUnit => {
  const vastAdUnit = new VpaidAdUnit(adChain, adContainer, options)
  const errorCallbacks: any[] = []

  vastAdUnit.onError = (handler: any): void => {
    errorCallbacks.push(handler)
  }

  vastAdUnit.cancel = jest.fn()

  ;(vastAdUnit as any).__simulateError = (error: Error): void => {
    errorCallbacks.forEach((handler) => handler(error))
  }

  return vastAdUnit
}

describe('startVideoAd', () => {
  let vastAdChain: VastChain
  let hybridVastAdChain: VastChain
  let wrongVastAdChain: VastChain
  let vpaidAdChain: VastChain
  let videoAdContainer: VideoAdContainer
  let options: any

  beforeEach(() => {
    vastAdChain = [
      {
        ad: inlineAd,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastInlineXML
      },
      {
        ad: wrapperAd,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      }
    ]
    hybridVastAdChain = [
      {
        ad: hybridInlineAd,
        parsedXML: hybridInlineParsedXML,
        requestTag: 'https://test.example.com/hybridVAST',
        XML: hybridInlineXML
      },
      {
        ad: wrapperAd,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      }
    ]
    vpaidAdChain = [
      {
        ad: vpaidInlineAd,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/hybridVAST',
        XML: vastVpaidInlineXML
      },
      {
        ad: wrapperAd,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      }
    ]
    wrongVastAdChain = [
      {
        ad: wrapperAd,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      }
    ]
    options = {
      onAdReady: jest.fn(),
      onError: jest.fn()
    }

    const placeholder = document.createElement('div')

    videoAdContainer = new VideoAdContainer(placeholder)
    ;(canPlay as jest.Mock).mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test("must complain if you don't pass a valid vastAdChain or videoAdContainer", () => {
    expect((startVideoAd as any)()).rejects.toBeInstanceOf(TypeError)
    expect((startVideoAd as any)([])).rejects.toBeInstanceOf(TypeError)
    expect((startVideoAd as any)(vastAdChain)).rejects.toBeInstanceOf(TypeError)
    expect((startVideoAd as any)(vastAdChain, {})).rejects.toBeInstanceOf(
      TypeError
    )
  })

  test('must fail if there is a problem creating the ad Unit', () => {
    expect.assertions(1)

    const adUnitError = new Error('AdUnit error')

    ;(createVideoAdUnit as jest.Mock).mockImplementation(() => {
      throw adUnitError
    })

    return expect(
      startVideoAd(vastAdChain, videoAdContainer, options)
    ).rejects.toBe(adUnitError)
  })

  test('must fail if the ad chain has no creatives', async () => {
    expect.assertions(2)

    try {
      await startVideoAd(wrongVastAdChain, videoAdContainer, options)
    } catch (error: any) {
      expect(error.code).toBe(ErrorCode.VAST_MEDIA_FILE_NOT_FOUND)
      expect(error.message).toBe(
        'No valid creative found in the passed VAST chain'
      )
    }
  })

  test('must cancel the ad unit if there is an error starting it', () => {
    expect.assertions(1)

    const adUnitError = new Error('adUnit error')
    const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options)

    ;(createVideoAdUnit as jest.Mock).mockImplementation(() => {
      adUnit.start = async () => {
        await (adUnit as any).__simulateError(adUnitError)
      }

      return adUnit
    })

    expect(startVideoAd(vastAdChain, videoAdContainer, options)).rejects.toBe(
      adUnitError
    )
  })
  ;[adUserClose, adStopped, closeLinear].forEach((event) => {
    test(`must cancel the ad unit start on '${event}' event`, async () => {
      expect.assertions(1)

      const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options)

      ;(createVideoAdUnit as jest.Mock).mockImplementation(() => {
        adUnit.start = async () => {
          await adUnit.emit(event)
        }

        return adUnit
      })

      try {
        await startVideoAd(vpaidAdChain, videoAdContainer, options)
      } catch (error: any) {
        expect(error.message).toBe(
          `Ad unit start rejected due to event '${event}'`
        )
      }
    })
  })

  test('must onAdReady event if the ad unit gets canceled', async () => {
    expect.assertions(5)
    ;(canPlay as jest.Mock).mockReturnValue(false)

    const adUnitError = new Error('adUnit error')
    const adUnit = createVPAIDAdUnitMock(
      vpaidAdChain,
      videoAdContainer,
      options
    )

    ;(createVideoAdUnit as jest.Mock).mockImplementation(() => {
      adUnit.start = async () => {
        await (adUnit as any).__simulateError(adUnitError)
      }

      return adUnit
    })

    try {
      await startVideoAd(vpaidAdChain, videoAdContainer, options)
    } catch (error) {
      expect(error).toBe(adUnitError)
      expect(createVideoAdUnit).toBeCalledTimes(1)
      expect(createVideoAdUnit).toHaveBeenCalledWith(
        vpaidAdChain,
        videoAdContainer,
        {
          ...options,
          type: 'VPAID'
        }
      )
      expect(options.onAdReady).toHaveBeenCalledTimes(1)
      expect(options.onAdReady).toHaveBeenCalledWith(adUnit)
    }
  })

  test('must return the ad unit', () => {
    expect.assertions(3)

    const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options)

    ;(createVideoAdUnit as jest.Mock).mockImplementation(() => {
      adUnit.start = async () => {
        await adUnit.emit(start)
      }

      return adUnit
    })

    expect(startVideoAd(vastAdChain, videoAdContainer, options)).resolves.toBe(
      adUnit
    )
    expect(options.onAdReady).toHaveBeenCalledTimes(1)
    expect(options.onAdReady).toHaveBeenCalledWith(adUnit)
  })

  describe('with hybrid VAST responses (a response that has a VPAID and a VAST ad together', () => {
    test('must favor vpaid', () => {
      const vpaidUnit = createAdUnitMock(vastAdChain, videoAdContainer, options)

      ;(createVideoAdUnit as jest.Mock).mockImplementation(() => {
        vpaidUnit.start = async () => {
          await vpaidUnit.emit('start')
        }

        return vpaidUnit
      })

      expect(
        startVideoAd(hybridVastAdChain, videoAdContainer, options)
      ).resolves.toBe(vpaidUnit)
      expect(createVideoAdUnit).toHaveBeenCalledTimes(1)
      expect(createVideoAdUnit).toHaveBeenCalledWith(
        hybridVastAdChain,
        videoAdContainer,
        {
          ...options,
          type: 'VPAID'
        }
      )
    })

    test('must fallback to VAST if VPAID fails', () => {
      const adUnitError = new Error('adUnit error')
      const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options)

      ;(createVideoAdUnit as jest.Mock)
        .mockImplementationOnce(() => {
          const vpaidUnit = createAdUnitMock(
            vastAdChain,
            videoAdContainer,
            options
          )

          vpaidUnit.start = async () => {
            await (vpaidUnit as any).__simulateError(adUnitError)
          }

          return vpaidUnit
        })
        .mockImplementationOnce(() => {
          adUnit.start = async () => {
            await adUnit.emit(start)
          }

          return adUnit
        })

      expect(
        startVideoAd(hybridVastAdChain, videoAdContainer, options)
      ).resolves.toBe(adUnit)
    })
  })
})
