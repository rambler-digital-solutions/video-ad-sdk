import MockVpaidCreativeAd from '../../../__tests__/MockVpaidCreativeAd'
import waitFor from '../waitFor'

jest.useFakeTimers()

describe('waitFor', () => {
  test('must resolve once the event is fired', async () => {
    const creativeAd = new MockVpaidCreativeAd()
    const callback = jest.fn()

    const promise = waitFor(creativeAd, 'adLoaded', 1000)

    promise.then(callback)

    expect(callback).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    creativeAd.emit('adLoaded')

    await promise

    expect(clearTimeout).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('must reject with an error if it times out', async () => {
    const creativeAd = new MockVpaidCreativeAd()
    const callback = jest.fn()

    const promise = waitFor(creativeAd, 'adLoaded', 2000)

    promise.then(callback)

    expect(callback).not.toHaveBeenCalled()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    try {
      await promise
    } catch (error) {
      expect(error.message).toBe("Timeout waiting for event 'adLoaded'")
      expect(callback).not.toHaveBeenCalled()
    }
  })

  test('must not call setTimeout if no time is passed', async () => {
    setTimeout.mockClear()
    clearTimeout.mockClear()

    const creativeAd = new MockVpaidCreativeAd()
    const callback = jest.fn()
    const promise = waitFor(creativeAd, 'adLoaded')

    promise.then(callback)

    expect(setTimeout).not.toHaveBeenCalled()

    creativeAd.emit('adLoaded')

    await promise

    expect(clearTimeout).not.toHaveBeenCalled()
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
