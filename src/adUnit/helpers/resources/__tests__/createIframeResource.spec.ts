import {createIframeResource} from '../createIframeResource'

test('createIframeResource must return an iframe', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  }
  const source = 'http://test.example.com/iframeResource'
  const resource = createIframeResource(source, payload)

  expect(resource).toBeInstanceOf(HTMLIFrameElement)
  expect(resource.src).toBe(source)
  expect(resource.width).toBe('100')
  expect(resource.height).toBe('100')
  expect(resource.getAttribute('sandbox')).toBe(
    'allow-forms allow-popups allow-scripts'
  )
})

test('createIframeResource must not set the width and height if not passed', () => {
  const payload = {
    data: {},
    document
  }
  const source = 'http://test.example.com/iframeResource'
  const resource = createIframeResource(source, payload)

  expect(resource).toBeInstanceOf(HTMLIFrameElement)
  expect(resource.src).toBe(source)
  expect(resource.width).toBe('')
  expect(resource.height).toBe('')
})
