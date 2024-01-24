import {MockVpaidCreativeAd} from '../../../__tests__/MockVpaidCreativeAd'
import {waitFor} from '../waitFor'

describe('waitFor', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(global, 'setTimeout')
    jest.spyOn(global, 'clearTimeout')
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('must resolve once the event is fired', async () => {
    const creativeAd: any = new MockVpaidCreativeAd()
    const callback = jest.fn()

    const promise = waitFor(creativeAd, 'adLoaded', 1000)
    // eslint-disable-next-line promise/prefer-await-to-then
    const promiseWithCallback = promise.then(callback)

    expect(callback).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    creativeAd.emit('adLoaded')

    await promiseWithCallback

    expect(clearTimeout).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('must reject with an error if it times out', async () => {
    const creativeAd: any = new MockVpaidCreativeAd()
    const callback = jest.fn()

    const promise = waitFor(creativeAd, 'adLoaded', 2000)
    // eslint-disable-next-line promise/prefer-await-to-then
    const promiseWithCallback = promise.then(callback)

    expect(callback).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    try {
      await promiseWithCallback
    } catch (error: any) {
      expect(error.message).toBe("Timeout waiting for event 'adLoaded'")
      expect(callback).not.toHaveBeenCalled()
    }
  })

  test('must not call setTimeout if no time is passed', async () => {
    ;(setTimeout as unknown as jest.Mock).mockClear()
    ;(clearTimeout as unknown as jest.Mock).mockClear()

    const creativeAd: any = new MockVpaidCreativeAd()
    const callback = jest.fn()
    const promise = waitFor(creativeAd, 'adLoaded')
    // eslint-disable-next-line promise/prefer-await-to-then
    const promiseWithCallback = promise.then(callback)

    expect(setTimeout).not.toHaveBeenCalled()

    creativeAd.emit('adLoaded')

    await promiseWithCallback

    expect(clearTimeout).not.toHaveBeenCalled()
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
