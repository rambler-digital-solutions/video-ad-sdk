import {
  inlineAd,
  inlineParsedXML,
  vastInlineXML,
  vastVpaidInlineXML,
  vastWrapperXML,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  wrapperAd,
  wrapperParsedXML
} from '../../../fixtures'
import {defer} from '../../utils/defer'
import {requestAd} from '../../vastRequest/requestAd'
import {requestNextAd} from '../../vastRequest/requestNextAd'
import {VastError} from '../../vastRequest/helpers/vastError'
import {run} from '../run'
import {runWaterfall} from '../runWaterfall'
import {VideoAdContainer} from '../../adContainer/VideoAdContainer'
import {VastAdUnit} from '../../adUnit/VastAdUnit'
import {trackError, ErrorCode} from '../../tracker'
import type {VastChain} from '../../types'
import {_protected} from '../../adUnit/VideoAdUnit'
import {isIos} from '../../utils/isIos'

jest.mock('../../utils/isIos')
jest.mock('../../vastRequest/requestAd', () => ({requestAd: jest.fn()}))
jest.mock('../../vastRequest/requestNextAd', () => ({requestNextAd: jest.fn()}))
jest.mock('../run', () => ({run: jest.fn()}))
jest.mock('../../tracker', () => ({
  ...jest.requireActual('../../tracker'),
  linearEvents: {},
  trackError: jest.fn()
}))

const noop = (): void => {}

describe('runWaterfall', () => {
  let adTag: string
  let vastAdChain: VastChain
  let options: any
  let placeholder: HTMLElement
  let adContainer: VideoAdContainer
  let adUnit: VastAdUnit

  beforeEach(() => {
    ;(isIos as jest.Mock).mockReturnValue(false)
    adTag = 'https://test.example.com/adtag'
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
    options = {
      tracker: jest.fn()
    }
    placeholder = document.createElement('div')
    adContainer = new VideoAdContainer(
      placeholder,
      document.createElement('video')
    )
    adUnit = new VastAdUnit(vastAdChain, adContainer, options)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('videoElement', () => {
    it('must call load  synchronously for iOS devices if you pass the video element', () => {
      const {videoElement} = adContainer

      Object.defineProperty(videoElement, 'load', {
        value: jest.fn()
      })
      Object.defineProperty(videoElement, 'canPlayType', {
        value: jest.fn(() => true)
      })
      ;(isIos as jest.Mock).mockReturnValue(true)

      runWaterfall(adTag, placeholder, {
        ...options,
        videoElement
      })

      expect(videoElement.load).toHaveBeenCalledTimes(1)
    })

    it("must not call load  synchronously for iOS devices if you don't pass the video element", () => {
      const {videoElement} = adContainer

      Object.defineProperty(videoElement, 'load', {
        value: jest.fn()
      })
      ;(isIos as jest.Mock).mockReturnValue(true)

      runWaterfall(adTag, placeholder, {
        ...options
      })

      expect(videoElement.load).toHaveBeenCalledTimes(0)
    })

    it('must not call load if the device is not iOS', () => {
      const {videoElement} = adContainer

      Object.defineProperty(videoElement, 'load', {
        value: jest.fn()
      })
      ;(isIos as jest.Mock).mockReturnValue(false)

      runWaterfall(adTag, placeholder, {
        ...options,
        videoElement
      })

      expect(videoElement.load).toHaveBeenCalledTimes(0)
    })
  })

  describe('after fetching Vast response', () => {
    test('must throw if it gets a vpaid ad with vpaidEnabled flag set to false', async () => {
      const onError = jest.fn()
      const vpaidChain = [
        {
          ad: vpaidInlineAd,
          parsedXML: vpaidInlineParsedXML,
          requestTag: 'https://test.example.com/vastadtaguri',
          XML: vastVpaidInlineXML
        }
      ]

      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vpaidChain))

      await new Promise((resolve) => {
        runWaterfall(adTag, placeholder, {
          ...options,
          onError,
          onRunFinish: resolve,
          vpaidEnabled: false
        })
      })

      expect(onError).toHaveBeenCalledTimes(2)

      const error = onError.mock.calls[0][0]

      expect(error.code).toBe(ErrorCode.VAST_UNEXPECTED_AD_TYPE)
      expect(error.message).toBe(
        'VPAID ads are not supported by the current player'
      )
      expect(trackError).toHaveBeenCalledWith(
        vpaidChain,
        expect.objectContaining({
          errorCode: ErrorCode.VAST_UNEXPECTED_AD_TYPE,
          tracker: options.tracker
        })
      )
    })

    test('must call onError if Vast response is undefined', async () => {
      const onError = jest.fn()

      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve())

      await new Promise((resolve) => {
        runWaterfall(adTag, placeholder, {
          ...options,
          onError,
          onRunFinish: resolve
        })
      })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0][0].message).toBe('Invalid VastChain')
    })

    test('must call onError if Vast response is an empty array', async () => {
      const onError = jest.fn()

      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve([]))

      await new Promise((resolve) => {
        runWaterfall(adTag, placeholder, {
          ...options,
          onError,
          onRunFinish: resolve
        })
      })

      expect(onError).toHaveBeenCalledTimes(2)
      expect(onError.mock.calls[0][0].message).toBe('Invalid VastChain')
    })

    test('must throw if the vastChain has an error and track the error', async () => {
      const onError = jest.fn()
      const vastChainError = new Error('boom')
      const vastChainWithError = [
        {
          ...vastAdChain[0],
          error: vastChainError,
          errorCode: ErrorCode.UNKNOWN_ERROR
        }
      ]

      ;(requestAd as jest.Mock).mockReturnValue(
        Promise.resolve(vastChainWithError)
      )

      await new Promise((resolve) => {
        runWaterfall(adTag, placeholder, {
          ...options,
          onError,
          onRunFinish: resolve
        })
      })

      expect(onError).toHaveBeenCalledTimes(2)
      expect(onError.mock.calls[0][0]).toBe(vastChainError)
      expect(trackError).toHaveBeenCalledWith(
        vastChainWithError,
        expect.objectContaining({
          errorCode: ErrorCode.UNKNOWN_ERROR,
          tracker: options.tracker
        })
      )
    })

    test('must throw if options.hooks.validateVastResponse fails', async () => {
      const onError = jest.fn()
      const vastChainError = new VastError('boom')

      vastChainError.code = ErrorCode.UNKNOWN_ERROR
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))

      await new Promise((resolve) => {
        runWaterfall(adTag, placeholder, {
          ...options,
          hooks: {
            validateVastResponse: () => {
              throw vastChainError
            }
          },
          onError,
          onRunFinish: resolve
        })
      })

      expect(onError).toHaveBeenCalledTimes(2)
      expect(onError.mock.calls[0][0]).toBe(vastChainError)
      expect(trackError).toHaveBeenCalledWith(
        vastAdChain,
        expect.objectContaining({
          errorCode: ErrorCode.UNKNOWN_ERROR,
          tracker: options.tracker
        })
      )
    })

    test('must be possible to transform the vast response before calling run', async () => {
      const deferred = defer<void>()

      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))

      const onAdStart = jest.fn()

      runWaterfall(adTag, placeholder, {
        ...options,
        hooks: {
          transformVastResponse: (vastResponse: any) => {
            vastResponse.__transformed = true

            return vastResponse
          }
        },
        onAdStart: (...args) => {
          deferred.resolve()
          onAdStart(...args)
        }
      })

      await deferred.promise

      expect(onAdStart).toHaveBeenCalledTimes(1)
      expect(onAdStart).toHaveBeenCalledWith(adUnit)
      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestAd).toHaveBeenCalledWith(
        adTag,
        expect.objectContaining(options)
      )
      expect(run).toHaveBeenCalledTimes(1)
      expect(run).toHaveBeenCalledWith(
        vastAdChain,
        placeholder,
        expect.objectContaining(options)
      )
      expect((vastAdChain as any).__transformed).toBe(true)
    })
  })

  describe('options.onAdStart', () => {
    test('must be called once the adUnit starts with the started ad unit', async () => {
      const deferred = defer<void>()

      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))

      const onAdStart = jest.fn()

      runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: (...args) => {
          deferred.resolve()
          onAdStart(...args)
        }
      })

      await deferred.promise

      expect(onAdStart).toHaveBeenCalledTimes(1)
      expect(onAdStart).toHaveBeenCalledWith(adUnit)
      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestAd).toHaveBeenCalledWith(
        adTag,
        expect.objectContaining(options)
      )
      expect(run).toHaveBeenCalledTimes(1)
      expect(run).toHaveBeenCalledWith(
        vastAdChain,
        placeholder,
        expect.objectContaining(options)
      )
    })
  })

  describe('options.onError', () => {
    test('must be called if there is an error with the waterfall', async () => {
      const runError = new Error('Error running the ad')
      const requestError = new Error('Error with the request')
      const onError = jest.fn()
      const deferred = defer<void>()

      ;(run as jest.Mock).mockReturnValue(Promise.reject(runError))
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.resolve(vastAdChain)
      )
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.reject(requestError)
      )

      runWaterfall(adTag, placeholder, {
        onError,
        onAdReady: noop,
        onRunFinish: () => deferred.resolve()
      })

      await deferred.promise

      expect(onError).toHaveBeenCalledTimes(3)
      expect(onError).toHaveBeenCalledWith(runError, {
        adUnit: undefined,
        vastChain: vastAdChain
      })

      expect(onError).toHaveBeenCalledWith(requestError, {
        adUnit: undefined,
        vastChain: undefined
      })

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestAd).toHaveBeenCalledWith(adTag, expect.any(Object))
      expect(requestNextAd).toHaveBeenCalledTimes(2)
      expect(requestNextAd).toHaveBeenCalledWith(
        vastAdChain,
        expect.any(Object)
      )
      expect(run).toHaveBeenCalledTimes(2)
      expect(run).toHaveBeenCalledWith(
        vastAdChain,
        placeholder,
        expect.any(Object)
      )
    })

    test('must be called if there is an error with the ad unit', async () => {
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))

      const deferred = defer<void>()
      const onError = jest.fn()

      adUnit.onError = jest.fn()

      runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: () => deferred.resolve(),
        onError
      })
      await deferred.promise

      const simulateAdUnitError = (adUnit.onError as jest.Mock).mock.calls[0][0]
      const mockError = new Error('mock error')

      simulateAdUnitError(mockError, {
        adUnit,
        vastChain: vastAdChain
      })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(mockError, {
        adUnit,
        vastChain: adUnit.vastChain
      })
    })
  })

  describe('options.onRunFinish', () => {
    test('must be called once the ad run finishes', async () => {
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))

      const deferred = defer<void>()
      const onRunFinish = jest.fn()

      runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: () => deferred.resolve(),
        onRunFinish
      })
      await deferred.promise

      adUnit[_protected].finish()
      expect(onRunFinish).toHaveBeenCalledTimes(1)
    })

    test('must be called if there is an error with the waterfall', async () => {
      const runError = new Error('Error running the ad')
      const requestError = new Error('Error with the request')
      const onRunFinish = jest.fn()
      const deferred = defer<void>()

      ;(run as jest.Mock).mockReturnValue(Promise.reject(runError))
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.resolve(vastAdChain)
      )
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.reject(requestError)
      )

      runWaterfall(adTag, placeholder, {
        onAdReady: noop,
        onRunFinish: () => {
          deferred.resolve()
          onRunFinish()
        }
      })
      await deferred.promise

      expect(onRunFinish).toHaveBeenCalledTimes(1)
    })
  })

  describe('with timeout', () => {
    let origDateNow: typeof Date.now

    beforeEach(() => {
      origDateNow = Date.now
      Date.now = jest.fn()
    })

    afterEach(() => {
      Date.now = origDateNow
    })

    test('must update the timeout', async () => {
      const deferred = defer<void>()
      const testOptions = {
        timeout: 1000
      }

      ;(Date.now as jest.Mock).mockReturnValueOnce(1000)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1100)
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))

      runWaterfall(adTag, placeholder, {
        ...testOptions,
        onAdReady: noop,
        onAdStart: () => deferred.resolve()
      })

      await deferred.promise

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestAd).toHaveBeenCalledWith(
        adTag,
        expect.objectContaining({
          ...testOptions,
          timeout: 1000
        })
      )

      expect(run).toHaveBeenCalledTimes(1)
      expect(run).toHaveBeenCalledWith(
        vastAdChain,
        placeholder,
        expect.objectContaining({
          ...testOptions,
          timeout: 900
        })
      )
    })

    test('must update the timeout with each loop', async () => {
      const deferred = defer<void>()
      const runError = new Error('Error running the ad')
      const requestError = new Error('Error with the request')
      const testOptions = {
        timeout: 1000
      }

      ;(Date.now as jest.Mock).mockReturnValueOnce(1000)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1100)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1200)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1300)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1400)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1500)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1600)
      ;(run as jest.Mock).mockReturnValue(Promise.reject(runError))
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.resolve(vastAdChain)
      )
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.reject(requestError)
      )

      runWaterfall(adTag, placeholder, {
        ...testOptions,
        onAdReady: noop,
        onRunFinish: () => deferred.resolve()
      })

      await deferred.promise

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestNextAd).toHaveBeenCalledTimes(2)
      expect(run).toHaveBeenCalledTimes(2)

      expect(requestAd).toHaveBeenCalledWith(
        adTag,
        expect.objectContaining({
          timeout: 1000
        })
      )

      expect(run).toHaveBeenCalledWith(
        vastAdChain,
        placeholder,
        expect.objectContaining({
          timeout: 900
        })
      )

      expect(requestNextAd).toHaveBeenCalledWith(
        vastAdChain,
        expect.objectContaining({
          timeout: 800
        })
      )

      expect(run).toHaveBeenCalledWith(
        vastAdChain,
        placeholder,
        expect.objectContaining({
          timeout: 700
        })
      )

      expect(requestNextAd).toHaveBeenCalledWith(
        vastAdChain,
        expect.objectContaining({
          timeout: 600
        })
      )
    })

    it('must finish the ad run if it times out fetching an ad', async () => {
      const deferred = defer<void>()
      const testOptions = {
        timeout: 1000
      }
      const onAdStart = jest.fn()
      const onError = jest.fn()

      ;(Date.now as jest.Mock).mockReturnValueOnce(1000)
      ;(Date.now as jest.Mock).mockReturnValueOnce(10000)

      runWaterfall(adTag, placeholder, {
        ...testOptions,
        onAdStart,
        onError,
        onAdReady: noop,
        onRunFinish: () => deferred.resolve()
      })

      await deferred.promise

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestAd).toHaveBeenCalledWith(
        adTag,
        expect.objectContaining({
          ...testOptions,
          timeout: 1000
        })
      )

      expect(run).toHaveBeenCalledTimes(0)
      expect(onAdStart).toHaveBeenCalledTimes(0)
      expect(onError).toHaveBeenCalledTimes(1)
    })

    test('must not continue the waterfall if ad run has timed out', async () => {
      const deferred = defer<void>()
      const testOptions = {
        timeout: 1000
      }
      const onAdStart = jest.fn()
      const onError = jest.fn()

      ;(Date.now as jest.Mock).mockReturnValueOnce(1000)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1100)
      ;(Date.now as jest.Mock).mockReturnValueOnce(2100)
      ;(run as jest.Mock).mockReturnValue(
        Promise.reject(new Error('Ad start timeout simulation'))
      )
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(requestNextAd as jest.Mock).mockReturnValueOnce(
        Promise.resolve(vastAdChain)
      )

      runWaterfall(adTag, placeholder, {
        ...testOptions,
        onAdStart,
        onError,
        onAdReady: noop,
        onRunFinish: () => deferred.resolve()
      })

      await deferred.promise

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(requestAd).toHaveBeenCalledWith(
        adTag,
        expect.objectContaining({
          ...testOptions,
          timeout: 1000
        })
      )

      expect(run).toHaveBeenCalledTimes(1)
      expect(onAdStart).toHaveBeenCalledTimes(0)
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })

  describe('cancel fn', () => {
    test('if called while fetching the vast chain, must prevent the ad run', async () => {
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))

      const deferred = defer<void>()

      const cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onAdReady: noop,
        onRunFinish: () => deferred.resolve()
      })

      cancelWaterfall()
      await deferred.promise

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(run).not.toHaveBeenCalled()
    })

    test('if called while starting the adUnit it must cancel the ad unit and call onRunFinish', async () => {
      let cancelWaterfall: any

      jest.spyOn(adUnit, 'cancel')
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockImplementation(() => {
        cancelWaterfall()

        return Promise.resolve(adUnit)
      })

      const deferred = defer<void>()
      const onAdStart = jest.fn()

      cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart,
        onRunFinish: () => deferred.resolve()
      })

      await deferred.promise

      expect(requestAd).toHaveBeenCalledTimes(1)
      expect(run).toHaveBeenCalledTimes(1)
      expect(onAdStart).not.toHaveBeenCalled()
      expect(adUnit.cancel).toHaveBeenCalledTimes(1)
    })

    test('if called after an ad unit started it must cancel the ad unit.', async () => {
      const deferred = defer<void>()

      jest.spyOn(adUnit, 'cancel')
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))

      const cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: () => deferred.resolve()
      })

      await deferred.promise
      expect(adUnit.cancel).not.toHaveBeenCalled()

      cancelWaterfall()
      expect(adUnit.cancel).toHaveBeenCalledTimes(1)
    })

    test('if called after the ad run finished, it must do nothing', async () => {
      ;(requestAd as jest.Mock).mockReturnValue(Promise.resolve(vastAdChain))
      ;(run as jest.Mock).mockReturnValue(Promise.resolve(adUnit))
      jest.spyOn(adUnit, 'cancel')

      const deferred = defer<void>()
      const onRunFinish = jest.fn()

      const cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: () => deferred.resolve(),
        onRunFinish
      })

      await deferred.promise
      adUnit[_protected].finish()

      expect(adUnit.cancel).not.toHaveBeenCalled()

      cancelWaterfall()
      expect(adUnit.cancel).toHaveBeenCalledTimes(0)
    })
  })
})
