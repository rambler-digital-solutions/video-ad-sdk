import onElementResize from '../onElementResize'

const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
let simulateAttrMutation: any

jest.mock('lodash.debounce', () => (fn: any) => fn)
jest.mock('../helpers/MutationObserver', () => {
  let mockHandler: any

  class MockMutationObserver {
    observe = mockObserve
    disconnect = mockDisconnect

    constructor(handler: any) {
      mockHandler = handler
    }
  }

  simulateAttrMutation = (node: HTMLElement, attributeName: string): MutationObserver =>
    mockHandler([
      {
        attributeName,
        target: node
      }
    ])

  return MockMutationObserver
})

test('onElementResize', () => {
  expect(onElementResize).toEqual(expect.any(Function))
})

test('onElementResize must complain if the passed target is not an Element', () => {
  expect(onElementResize).toThrow(TypeError)
})

test("onElementResize mut complain if you don't pass a callback function", () => {
  expect(() => onElementResize(document.createElement('div'), undefined as any)).toThrow(
    TypeError
  )
})

test('onElementResize not must call the callback if the changed style does not change the element size', () => {
  const target = document.createElement('div')
  const mock = jest.fn()

  onElementResize(target, () => mock())

  expect(mock).not.toHaveBeenCalled()

  simulateAttrMutation(target, 'style')

  expect(mock).not.toHaveBeenCalled()
})

test('onElementResize must call the callback if the element width changes on style change', () => {
  const target = document.createElement('DIV')
  const mock = jest.fn()

  onElementResize(target, () => mock())

  expect(mock).not.toHaveBeenCalled()

  target.style.width = '400px'
  simulateAttrMutation(target, 'style')
  expect(mock).toHaveBeenCalled()
})

test('onElementResize must call the callback if the element resizes', () => {
  const target = document.createElement('DIV')
  const mock = jest.fn()

  onElementResize(target, () => mock())
  expect(mock).not.toHaveBeenCalled()

  const resizeObjElement = target.querySelector('iframe')

  // jsdom does not add the content window to iframe elements for the sack of the test we fake it
  // with the normal window.
  Object.defineProperty(resizeObjElement, 'contentWindow', {
    value: global.window
  })
  resizeObjElement?.onload?.(undefined as any)

  target.style.width = '400px'
  resizeObjElement?.contentWindow?.dispatchEvent(new Event('resize'))
  expect(mock).toHaveBeenCalled()
})

test('onElementResize must return a disconnect fn', () => {
  const target = document.createElement('DIV')
  const mock = jest.fn()
  const disconnect = onElementResize(target, () => mock())
  const resizeObjElement = target.querySelector('iframe')

  // jsdom does not add the content window to iframe elements for the sack of the test we fake it
  // with the normal window.
  Object.defineProperty(resizeObjElement, 'contentWindow', {
    value: global.window
  })
  resizeObjElement?.onload?.(undefined as any)

  expect(mock).not.toHaveBeenCalled()

  disconnect()

  target.style.width = '400px'
  expect(mockDisconnect).toHaveBeenCalled()
  simulateAttrMutation(target, 'style')
  expect(mock).not.toHaveBeenCalled()

  target.style.width = '300px'
  resizeObjElement?.contentWindow?.dispatchEvent(new Event('resize'))
  expect(mock).not.toHaveBeenCalled()
})
