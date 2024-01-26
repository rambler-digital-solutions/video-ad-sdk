import {createHtmlResource} from '../createHtmlResource'
import {createIframeResource} from '../createIframeResource'
import {createStaticResource} from '../createStaticResource'
import {createResource} from '../createResource'

const mockResource = document.createElement('div')

jest.mock('../createHtmlResource', () => ({
  createHtmlResource: jest.fn(() => mockResource)
}))
jest.mock('../createIframeResource', () => ({
  createIframeResource: jest.fn(() => mockResource)
}))
jest.mock('../createStaticResource', () => ({
  createStaticResource: jest.fn(() => mockResource)
}))

test('createResource must create an static resource if you pass `staticResource` in the data', () => {
  const source = 'http://test.example.com/resource'
  const data = {
    staticResource: source
  }
  const resource = createResource(document, data)

  expect(resource).toBe(mockResource)
  expect(createStaticResource).toBeCalledWith(
    source,
    expect.objectContaining({
      data,
      document
    })
  )
})

test('createResource must create a html resource if you pass `htmlResource` in the data', () => {
  const source = 'http://test.example.com/resource'
  const data = {
    htmlResource: source
  }
  const resource = createResource(document, data)

  expect(resource).toBe(mockResource)
  expect(createHtmlResource).toBeCalledWith(
    source,
    expect.objectContaining({
      data,
      document
    })
  )
})

test('createResource must create an iframe resource if you pass `iFrameResource` in the data', () => {
  const source = 'http://test.example.com/resource'
  const data = {
    iFrameResource: source
  }
  const resource = createResource(document, data)

  expect(resource).toBe(mockResource)
  expect(createIframeResource).toBeCalledWith(
    source,
    expect.objectContaining({
      data,
      document
    })
  )
})
