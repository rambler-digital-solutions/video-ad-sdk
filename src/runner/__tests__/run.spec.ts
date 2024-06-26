import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures'
import type {VastChain} from '../../types'
import {startVideoAd} from '../helpers/startVideoAd'
import {run} from '../run'
import {VideoAdContainer} from '../../adContainer/VideoAdContainer'
import {VastAdUnit} from '../../adUnit/VastAdUnit'
import {createVideoAdContainer} from '../../adContainer/createVideoAdContainer'
import {defer} from '../../utils/defer'

jest.mock('../helpers/startVideoAd', () => ({startVideoAd: jest.fn()}))
jest.mock('../../adContainer/createVideoAdContainer', () => ({
  createVideoAdContainer: jest.fn()
}))
jest.mock('../../tracker', () => ({
  ...jest.requireActual('../../tracker'),
  linearEvents: {},
  trackError: jest.fn()
}))

const noop = (): void => {}

describe('run', () => {
  let vastAdChain: VastChain
  let options: any
  let placeholder: HTMLElement
  let adContainer: VideoAdContainer
  let adUnit: VastAdUnit

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
    options = {
      tracker: jest.fn(),
      videoElement: document.createElement('video')
    }
    placeholder = document.createElement('div')
    adContainer = new VideoAdContainer(
      placeholder,
      document.createElement('video')
    )
    adUnit = new VastAdUnit(vastAdChain, adContainer, options)
    ;(createVideoAdContainer as jest.Mock).mockImplementation(() => adContainer)
    ;(startVideoAd as jest.Mock).mockImplementation(() =>
      Promise.resolve(adUnit)
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test('must return the started adUnit', async () => {
    expect(await run(vastAdChain, placeholder, options)).toBe(adUnit)
    expect(createVideoAdContainer).toHaveBeenCalledWith(
      placeholder,
      options.videoElement
    )
    expect(startVideoAd).toHaveBeenCalledWith(vastAdChain, adContainer, options)
  })

  test('must destroy the ad container on adUnit finish', async () => {
    adContainer.destroy = jest.fn()

    expect(await run(vastAdChain, placeholder, options)).toBe(adUnit)
    expect(adContainer.destroy).toHaveBeenCalledTimes(0)

    adUnit.cancel()
    expect(adContainer.destroy).toHaveBeenCalledTimes(1)
  })

  test('must propagate adUnit creation errors', async () => {
    expect.assertions(1)

    const testError = new Error('Ad container creation error')

    ;(createVideoAdContainer as jest.Mock).mockImplementation(() => {
      throw testError
    })

    try {
      await run(vastAdChain, placeholder, options)
    } catch (error) {
      expect(error).toBe(testError)
    }
  })

  test('must destroy the adContainer if there is a problem starting the adUnit', async () => {
    const adUnitError = new Error('boom')

    adContainer.destroy = jest.fn()
    ;(startVideoAd as jest.Mock).mockImplementation(() =>
      Promise.reject(adUnitError)
    )

    try {
      await run(vastAdChain, placeholder, {
        onAdReady: noop
      })
    } catch {
      expect(adContainer.destroy).toHaveBeenCalledTimes(1)
    }
  })

  describe('with timeout', () => {
    test('must throw and destroy the adContainer on timeout', async () => {
      adContainer.destroy = jest.fn()
      ;(startVideoAd as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )

      try {
        await run(vastAdChain, placeholder, {
          timeout: 0,
          onAdReady: noop
        })
      } catch (error: any) {
        expect(error.message).toBe('Timeout while starting the ad')
        expect(adContainer.destroy).toHaveBeenCalledTimes(1)
      }
    })

    test('must cancel the adUnit if it timed out and it was started', async () => {
      const deferred = defer()
      const mockAdUnit = {
        cancel: jest.fn(),
        isStarted: () => true
      }

      adContainer.destroy = jest.fn()
      ;(startVideoAd as jest.Mock).mockImplementation(() => deferred.promise)

      try {
        await run(vastAdChain, placeholder, {
          timeout: 0,
          onAdReady: noop
        })
      } catch (error: any) {
        expect(error.message).toBe('Timeout while starting the ad')
        expect(adContainer.destroy).toHaveBeenCalledTimes(1)
      }

      deferred.resolve(mockAdUnit)
      await deferred.promise

      expect(mockAdUnit.cancel).toHaveBeenCalledTimes(1)
    })

    test('must not cancel the adUnit if it timed out and it was not started', async () => {
      const deferred = defer()
      const mockAdUnit = {
        cancel: jest.fn(),
        isStarted: () => false
      }

      adContainer.destroy = jest.fn()
      ;(startVideoAd as jest.Mock).mockImplementation(() => deferred.promise)

      try {
        await run(vastAdChain, placeholder, {
          timeout: 0,
          onAdReady: noop
        })
      } catch (error: any) {
        expect(error.message).toBe('Timeout while starting the ad')
        expect(adContainer.destroy).toHaveBeenCalledTimes(1)
      }

      deferred.resolve(mockAdUnit)
      await deferred.promise

      expect(mockAdUnit.cancel).toHaveBeenCalledTimes(0)
    })

    test('must start the ad if the adUnit starts within the timeout', async () => {
      const testOptions = {
        ...options,
        timeout: 10000
      }

      expect(await run(vastAdChain, placeholder, testOptions)).toBe(adUnit)
      expect(createVideoAdContainer).toHaveBeenCalledWith(
        placeholder,
        options.videoElement
      )
      expect(startVideoAd).toHaveBeenCalledWith(
        vastAdChain,
        adContainer,
        testOptions
      )
    })
  })
})
