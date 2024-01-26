import {
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../fixtures'
import {VideoAdContainer} from '../../adContainer/VideoAdContainer'
import {
  iconClick,
  iconView,
  notViewable,
  start,
  viewable,
  viewUndetermined
} from '../../tracker/linearEvents'
import type {VastChain} from '../../types'
import {getViewable} from '../../vastSelectors'
import {addIcons} from '../helpers/icons/addIcons'
import {retrieveIcons} from '../helpers/icons/retrieveIcons'
import {
  onElementResize,
  onElementVisibilityChange
} from '../helpers/dom/elementObservers'
import {preventManualProgress} from '../helpers/dom/preventManualProgress'
import {VideoAdUnit, _protected} from '../VideoAdUnit'
import {finish} from '../adUnitEvents'

const mockDrawIcons = jest.fn()
const mockRemoveIcons = jest.fn()
const mockHasPendingRedraws = jest.fn(() => false)

jest.mock('../helpers/icons/addIcons', () => ({
  addIcons: jest.fn(() => ({
    drawIcons: mockDrawIcons,
    hasPendingIconRedraws: mockHasPendingRedraws,
    removeIcons: mockRemoveIcons
  }))
}))
jest.mock('../helpers/icons/retrieveIcons')
jest.mock('../helpers/dom/elementObservers', () => ({
  onElementResize: jest.fn(),
  onElementVisibilityChange: jest.fn()
}))
jest.mock('../../vastSelectors', () => ({
  ...jest.requireActual('../../vastSelectors'),
  getViewable: jest.fn()
}))

jest.mock('../helpers/dom/preventManualProgress')
describe('VideoAdUnit', () => {
  let vpaidChain: VastChain
  let videoAdContainer: VideoAdContainer
  let stopPreventManualProgress: any
  let viewableImpression: boolean
  let origScreen: Screen

  beforeEach(() => {
    vpaidChain = [
      {
        ad: vpaidInlineAd,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastVpaidInlineXML
      }
    ]
    videoAdContainer = new VideoAdContainer(document.createElement('DIV'))
    stopPreventManualProgress = jest.fn()
    ;(preventManualProgress as jest.Mock).mockReturnValue(
      stopPreventManualProgress
    )
    viewableImpression = false
    ;(getViewable as jest.Mock).mockImplementation(() => viewableImpression)
    origScreen = window.screen

    Object.defineProperty(window, 'screen', {
      value: {
        height: 800,
        width: 1200
      },
      writable: true
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()

    Object.defineProperty(window, 'screen', {
      value: origScreen,
      writable: true
    })
  })

  test('must prevent manual progress while the ad unit is running', () => {
    const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

    expect(preventManualProgress).toHaveBeenCalledTimes(1)
    expect(preventManualProgress).toHaveBeenCalledWith(
      videoAdContainer.videoElement
    )
    expect(stopPreventManualProgress).not.toHaveBeenCalled()

    adUnit[_protected].finish()
    expect(preventManualProgress).toHaveBeenCalledTimes(1)
    expect(stopPreventManualProgress).toHaveBeenCalledTimes(1)
  })

  describe('icons', () => {
    test('must be added to the class instance', () => {
      const icons = [
        {
          height: 20,
          width: 20,
          xPosition: 'left',
          yPosition: 'top'
        }
      ]

      ;(retrieveIcons as jest.Mock).mockReturnValue(icons)

      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      expect(adUnit.icons).toBe(icons)
      expect(addIcons).toHaveBeenCalledTimes(1)
      expect(addIcons).toHaveBeenCalledWith(icons, {
        logger: adUnit.logger,
        onIconClick: expect.any(Function),
        onIconView: expect.any(Function),
        videoAdContainer
      })
    })

    test('must remove the icons on ad finish', () => {
      const icons = [
        {
          height: 20,
          width: 20,
          xPosition: 'left',
          yPosition: 'top'
        }
      ]

      ;(retrieveIcons as jest.Mock).mockReturnValue(icons)

      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      adUnit[_protected].finish()

      expect(mockRemoveIcons).toHaveBeenCalledTimes(1)
    })

    test(`must emit '${iconClick}' event on click`, async () => {
      ;(addIcons as jest.Mock).mockClear()

      const icons = [
        {
          height: 20,
          width: 20,
          xPosition: 'left',
          yPosition: 'top'
        }
      ]

      ;(retrieveIcons as jest.Mock).mockReturnValue(icons)

      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      expect(adUnit.icons).toBe(icons)

      const passedConfig = (addIcons as jest.Mock).mock.calls[0][1]

      const promise = new Promise((resolve) => {
        adUnit.on(iconClick, (...args) => {
          resolve(args)
        })
      })

      passedConfig.onIconClick(icons[0])

      const passedArguments = await promise

      expect(passedArguments).toEqual([
        {
          adUnit,
          data: icons[0],
          type: iconClick
        }
      ])
    })

    test(`must emit '${iconView}' event on view`, async () => {
      ;(addIcons as jest.Mock).mockClear()

      const icons = [
        {
          height: 20,
          width: 20,
          xPosition: 'left',
          yPosition: 'top'
        }
      ]

      ;(retrieveIcons as jest.Mock).mockReturnValue(icons)

      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      expect(adUnit.icons).toBe(icons)

      const passedConfig = (addIcons as jest.Mock).mock.calls[0][1]

      const promise = new Promise((resolve) => {
        adUnit.on(iconView, (...args) => {
          resolve(args)
        })
      })

      passedConfig.onIconView(icons[0])

      const passedArguments = await promise

      expect(passedArguments).toEqual([
        {
          adUnit,
          data: icons[0],
          type: iconView
        }
      ])
    })
  })

  describe('method', () => {
    ;[
      'start',
      'resume',
      'pause',
      'skip',
      'paused',
      'duration',
      'currentTime',
      'setVolume',
      'getVolume',
      'cancel'
    ].forEach((method) => {
      test(`${method} must throw if called`, () => {
        const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

        expect(() => (adUnit as any)[method]()).toThrow(
          'VideoAdUnit method must be implemented on child class'
        )
      })
    })
  })

  describe('onFinish', () => {
    let adUnit: VideoAdUnit

    beforeEach(() => {
      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)
    })

    test(`must emit ${finish} on ad finish`, () => {
      const spy = jest.fn()

      adUnit.on(finish, spy)
      adUnit[_protected].finish()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith({
        adUnit,
        type: finish
      })
    })

    test("must throw if you don't pass a callback function ", () => {
      expect(() => adUnit.onFinish(undefined as any)).toThrow(
        'Expected a callback function'
      )
    })

    test('must be called if the ad unit finishes', () => {
      const callback = jest.fn()

      adUnit.onFinish(callback)

      expect(callback).not.toHaveBeenCalled()

      adUnit[_protected].finish()

      expect(callback).toHaveBeenCalledTimes(1)
    })

    // REGRESSION
    test('mut be already finished on callback execution', () => {
      expect.assertions(3)

      let callbackFinishState = false
      const callback = (): void => {
        callbackFinishState = adUnit.isFinished()
      }

      expect(adUnit.isFinished()).toBe(false)
      adUnit.onFinish(callback)

      adUnit[_protected].finish()
      expect(adUnit.isFinished()).toBe(true)
      expect(callbackFinishState).toBe(true)
    })
  })

  describe('onError', () => {
    let adUnit: VideoAdUnit

    beforeEach(() => {
      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)
    })

    test("must throw if you don't pass a callback function ", () => {
      expect(() => adUnit.onError(undefined as any)).toThrow(
        'Expected a callback function'
      )
    })
  })

  describe('resize', () => {
    let adUnit: VideoAdUnit

    beforeEach(() => {
      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)
    })

    test('must not redraw the icons if the adUnit is not started', async () => {
      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      await adUnit.resize(640, 480, 'normal')

      expect(mockDrawIcons).toHaveBeenCalledTimes(0)
    })

    test('must not redraw the icons if the adUnit is finished', async () => {
      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      adUnit[_protected].finished = true

      await adUnit.resize(640, 480, 'normal')

      expect(mockDrawIcons).toHaveBeenCalledTimes(0)
    })

    test('must redraw the icons', async () => {
      const icons = [
        {
          height: 20,
          width: 20,
          xPosition: 'left',
          yPosition: 'top'
        }
      ]

      ;(retrieveIcons as jest.Mock).mockReturnValue(icons)
      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      adUnit[_protected].started = true
      await adUnit.resize(640, 480, 'normal')

      expect(mockDrawIcons).toHaveBeenCalledTimes(1)
    })
  })

  describe('option.responsive', () => {
    let resizeElement: HTMLElement
    let simulateResize: any
    let unsubscribe: any

    beforeEach(() => {
      ;(onElementResize as jest.Mock).mockImplementation(
        (element, callback) => {
          resizeElement = element
          simulateResize = callback
          unsubscribe = jest.fn()

          return unsubscribe
        }
      )
    })

    test('must do nothing if false', () => {
      let adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      adUnit.emit(start)

      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {})
      adUnit.emit(start)

      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        responsive: false
      })
      adUnit.emit(start)

      expect(onElementResize).not.toHaveBeenCalled()
    })

    test('if true must resize the adUnit on ad container resize', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        responsive: true
      })

      jest.spyOn(adUnit, 'resize')
      adUnit.emit(start)

      expect(onElementResize).toHaveBeenCalledTimes(1)

      Object.defineProperty(resizeElement, 'clientWidth', {
        value: 150,
        writable: true
      })

      Object.defineProperty(resizeElement, 'clientHeight', {
        value: 100,
        writable: true
      })

      simulateResize()

      expect(adUnit.resize).toHaveBeenCalledTimes(1)
      expect(adUnit.resize).toHaveBeenCalledWith(150, 100, 'thumbnail')

      simulateResize()

      // must not resize on false positives
      expect(adUnit.resize).toHaveBeenCalledTimes(1)
    })

    test('must do nothing if finished', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        responsive: true
      })

      adUnit.resize = jest.fn()
      adUnit.emit(start)
      adUnit[_protected].finished = true

      Object.defineProperty(resizeElement, 'clientWidth', {
        value: 150,
        writable: true
      })

      Object.defineProperty(resizeElement, 'clientHeight', {
        value: 100,
        writable: true
      })

      simulateResize()

      expect(adUnit.resize).toHaveBeenCalledTimes(0)
    })

    test('must unregister `onElementResize` on finish', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        responsive: true
      })

      adUnit.emit(start)
      expect(onElementResize).toHaveBeenCalledTimes(1)
      expect(unsubscribe).toHaveBeenCalledTimes(0)

      adUnit[_protected].finish()
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('option.viewability', () => {
    let simulateVisibilityChange: any
    let unsubscribe: any

    beforeEach(() => {
      ;(onElementVisibilityChange as jest.Mock).mockImplementation(
        (_element, callback) => {
          simulateVisibilityChange = callback
          unsubscribe = jest.fn()

          return unsubscribe
        }
      )
    })

    test('must do nothing if false', () => {
      let adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      adUnit.emit(start)

      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {})
      adUnit.emit(start)

      adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        viewability: false
      })
      adUnit.emit(start)

      expect(onElementVisibilityChange).not.toHaveBeenCalled()
    })

    test('must pause and resume the ad unit on visibility change if true', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        viewability: true
      })

      adUnit.pause = jest.fn()
      adUnit.resume = jest.fn()

      expect(onElementVisibilityChange).not.toHaveBeenCalled()
      adUnit.emit(start)
      expect(onElementVisibilityChange).toHaveBeenCalledTimes(1)

      expect(adUnit.pause).toHaveBeenCalledTimes(0)
      expect(adUnit.resume).toHaveBeenCalledTimes(0)
      simulateVisibilityChange(false)
      expect(adUnit.pause).toHaveBeenCalledTimes(1)
      expect(adUnit.resume).toHaveBeenCalledTimes(0)
      simulateVisibilityChange(true)
      expect(adUnit.pause).toHaveBeenCalledTimes(1)
      expect(adUnit.resume).toHaveBeenCalledTimes(1)
    })

    test('must do nothing if finished', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        viewability: true
      })

      adUnit.pause = jest.fn()
      adUnit.resume = jest.fn()
      adUnit.emit(start)
      adUnit[_protected].finished = true

      simulateVisibilityChange(false)
      expect(adUnit.pause).toHaveBeenCalledTimes(0)
      expect(adUnit.resume).toHaveBeenCalledTimes(0)
      simulateVisibilityChange(true)
      expect(adUnit.pause).toHaveBeenCalledTimes(0)
      expect(adUnit.resume).toHaveBeenCalledTimes(0)
    })

    test('must unregister `onElementVisibilityChange` on finish', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer, {
        viewability: true
      })

      adUnit.emit(start)
      expect(onElementVisibilityChange).toHaveBeenCalledTimes(1)
      expect(unsubscribe).toHaveBeenCalledTimes(0)

      adUnit[_protected].finish()
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('viewable impression', () => {
    let simulateVisibilityChange: any
    let unsubscribe: any

    beforeEach(() => {
      viewableImpression = true
      ;(onElementVisibilityChange as jest.Mock).mockImplementation(
        (_element, callback) => {
          simulateVisibilityChange = callback
          unsubscribe = jest.fn()

          return unsubscribe
        }
      )
    })

    test('must emit viewable when the ad unit meets criteria for a viewable impression', async () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      jest.spyOn(adUnit, 'emit')
      expect(onElementVisibilityChange).not.toHaveBeenCalled()
      adUnit.emit(start)
      expect(onElementVisibilityChange).toHaveBeenCalledTimes(1)

      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(notViewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewUndetermined)

      simulateVisibilityChange(false)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(notViewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewUndetermined)

      const eventPromise = new Promise((resolve) =>
        adUnit.on(viewable, resolve)
      )

      simulateVisibilityChange(true)

      await eventPromise

      expect(adUnit.emit).toHaveBeenCalledWith(viewable, expect.any(Object))
      expect(adUnit.emit).not.toHaveBeenCalledWith(notViewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewUndetermined)
    })

    test('must emit viewUndetermined if cannot be determined whether the ad unit meets criteria for a viewable impression', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      jest.spyOn(adUnit, 'emit')
      expect(onElementVisibilityChange).not.toHaveBeenCalled()
      adUnit.emit(start)
      expect(onElementVisibilityChange).toHaveBeenCalledTimes(1)

      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(notViewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewUndetermined)

      simulateVisibilityChange(undefined)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(notViewable)
      expect(adUnit.emit).toHaveBeenCalledWith(
        viewUndetermined,
        expect.any(Object)
      )
    })

    test('must emit notViewable on finish if ad unit never meets criteria for a viewable impression', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      jest.spyOn(adUnit, 'emit')
      expect(onElementVisibilityChange).not.toHaveBeenCalled()
      adUnit.emit(start)
      expect(onElementVisibilityChange).toHaveBeenCalledTimes(1)

      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(notViewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewUndetermined)

      adUnit[_protected].finish()
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewUndetermined)
      expect(adUnit.emit).toHaveBeenCalledWith(notViewable, expect.any(Object))
    })

    test('must do nothing if finished', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      jest.spyOn(adUnit, 'emit')
      adUnit.emit(start)
      adUnit[_protected].finished = true

      simulateVisibilityChange(false)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
      simulateVisibilityChange(true)
      expect(adUnit.emit).not.toHaveBeenCalledWith(viewable)
    })

    test('must unregister `onElementVisibilityChange` on finish', () => {
      const adUnit = new VideoAdUnit(vpaidChain, videoAdContainer)

      adUnit.emit(start)
      expect(onElementVisibilityChange).toHaveBeenCalledTimes(1)
      expect(unsubscribe).toHaveBeenCalledTimes(0)

      adUnit[_protected].finish()
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })
  })
})
