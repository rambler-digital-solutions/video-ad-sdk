import onElementVisibilityChange from '../onElementVisibilityChange'

const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
let simulateIntersection: any

jest.mock('../helpers/IntersectionObserver', () => {
  let mockHandler: any

  class MockIntersectionObserver {
    observe = mockObserve
    disconnect = mockDisconnect

    constructor(handler: any) {
      mockHandler = handler
    }
  }

  simulateIntersection = (
    target: HTMLElement,
    intersectionRatio: number
  ): IntersectionObserver =>
    mockHandler([
      {
        intersectionRatio,
        target
      }
    ])

  return MockIntersectionObserver
})

const once = (
  context: Window | Document | Element,
  eventName: string,
  listener: (...args: any[]) => void
): void => {
  const handler = (...args: any[]): void => {
    context.removeEventListener(eventName, handler)
    listener(...args)
  }

  context.addEventListener(eventName, handler)
}

const waitForEvent = (
  eventName: string,
  context: Window | Document | Element = window
): Promise<Event> =>
  new Promise<Event>((resolve) => {
    once(context, eventName, resolve)
  })

let origHidden: boolean

jest.mock('lodash.debounce', () => (fn: any) => fn)

beforeEach(() => {
  origHidden = document.hidden

  Object.defineProperty(document, 'hidden', {
    writable: true
  })
})

afterEach(() => {
  Object.defineProperty(document, 'hidden', {
    value: origHidden,
    writable: true
  })

  mockObserve.mockReset()
  mockDisconnect.mockReset()
})

test('onElementVisibilityChange must be a function', () => {
  expect(onElementVisibilityChange).toEqual(expect.any(Function))
})

test('onElementVisibilityChange must complain if the passed target is not an Element', () => {
  expect(onElementVisibilityChange).toThrow(TypeError)
})

test("onElementVisibilityChange mut complain if you don't pass a callback function", () => {
  expect(() =>
    onElementVisibilityChange(document.createElement('div'), undefined as any)
  ).toThrow(TypeError)
})

test('onElementVisibilityChange must call callback with true if the element is visible', () => {
  const target = document.createElement('DIV')
  const mock = jest.fn()

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  simulateIntersection(target, 1)

  expect(mock).toHaveBeenCalledWith(true)

  disconnect()
})

test('onElementVisibilityChange must call callback with true if the element becomes visible on intersection', () => {
  const target = document.createElement('div')
  const mock = jest.fn()

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  simulateIntersection(target, 0)

  expect(mock).not.toHaveBeenCalled()

  simulateIntersection(target, 1)

  expect(mock).toHaveBeenCalledWith(true)

  disconnect()
})

test('onElementVisibilityChange must call callback with false if the element becomes hidden on intersection', () => {
  const target = document.createElement('div')
  const mock = jest.fn()

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  simulateIntersection(target, 1)

  expect(mock).toHaveBeenCalledWith(true)

  simulateIntersection(target, 0)

  expect(mock).toHaveBeenCalledWith(false)

  disconnect()
})

test('onElementVisibilityChange must call callback with true if the element becomes visible on visibilitychange', async () => {
  const target = document.createElement('div')
  const mock = jest.fn()

  Object.defineProperty(document, 'hidden', {
    value: true,
    writable: true
  })

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  simulateIntersection(target, 1)

  expect(mock).not.toHaveBeenCalled()

  const waitPromise = waitForEvent('visibilitychange', document)

  Object.defineProperty(document, 'hidden', {
    value: false,
    writable: true
  })
  document.dispatchEvent(new Event('visibilitychange'))

  await waitPromise

  expect(mock).toHaveBeenCalledWith(true)

  disconnect()
})

test('onElementVisibilityChange must call callback with false if the element becomes hidden on visibilitychange', async () => {
  const target = document.createElement('div')
  const mock = jest.fn()

  Object.defineProperty(document, 'hidden', {
    value: false,
    writable: true
  })

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  simulateIntersection(target, 1)

  expect(mock).toHaveBeenCalledWith(true)

  const waitPromise = waitForEvent('visibilitychange', document)

  Object.defineProperty(document, 'hidden', {
    value: true,
    writable: true
  })
  document.dispatchEvent(new Event('visibilitychange'))

  await waitPromise

  expect(mock).toHaveBeenCalledWith(false)

  disconnect()
})

test('onElementVisibilityChange on element removed must remove the all the listeners if there are no more elements to check', () => {
  const target = document.createElement('div')
  const mock = jest.fn()

  document.removeEventListener = jest.fn()

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  expect(mockDisconnect).not.toHaveBeenCalled()
  expect(document.removeEventListener).not.toHaveBeenCalledWith(
    'visibilitychange',
    expect.any(Function)
  )

  disconnect()

  expect(mockDisconnect).toHaveBeenCalled()
  expect(document.removeEventListener).toHaveBeenCalledWith(
    'visibilitychange',
    expect.any(Function)
  )
})

test('onElementVisibilityChange on element remove must not remove the all the listeners if there other checkeed elements use the same target', () => {
  const target = document.createElement('DIV')
  const mock = jest.fn()

  document.removeEventListener = jest.fn()

  const disconnect = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )
  const disconnect2 = onElementVisibilityChange(target, (...args) =>
    mock(...args)
  )

  expect(mockDisconnect).not.toHaveBeenCalled()
  expect(document.removeEventListener).not.toHaveBeenCalledWith(
    'visibilitychange',
    expect.any(Function)
  )

  disconnect()
  expect(mockDisconnect).not.toHaveBeenCalled()
  expect(document.removeEventListener).not.toHaveBeenCalledWith(
    'visibilitychange',
    expect.any(Function)
  )

  disconnect2()
  expect(mockDisconnect).toHaveBeenCalled()
  expect(document.removeEventListener).toHaveBeenCalledWith(
    'visibilitychange',
    expect.any(Function)
  )
})
