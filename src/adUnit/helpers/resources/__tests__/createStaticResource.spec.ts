import {createStaticResource} from '../createStaticResource'

test('createStaticResource must return an image', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  }
  const source = 'http://test.example.com/staticResource'
  const resource = createStaticResource(source, payload)

  expect(resource).toBeInstanceOf(HTMLImageElement)
  expect(resource.src).toBe(source)
  expect(resource.width).toBe(100)
  expect(resource.height).toBe(100)
})

test('createStaticResource must not set the width and height if not passed', () => {
  const payload = {
    data: {},
    document
  }
  const source = 'http://test.example.com/staticResource'
  const resource = createStaticResource(source, payload)

  expect(resource).toBeInstanceOf(HTMLImageElement)
  expect(resource.src).toBe(source)
  expect(resource.width).toBe(0)
  expect(resource.height).toBe(0)
})
