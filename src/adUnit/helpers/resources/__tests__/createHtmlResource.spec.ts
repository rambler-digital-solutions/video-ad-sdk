import {waitFor} from '../../dom/waitFor'
import {createHtmlResource} from '../createHtmlResource'

test('createHtmlResource must return an div', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  }
  const source = 'http://test.example.com/htmlResource'
  const resource = createHtmlResource(source, payload)

  expect(resource).toBeInstanceOf(HTMLDivElement)
  expect(resource.style.width).toBe('100px')
  expect(resource.style.height).toBe('100px')
})

test('createHtmlResource must not set the width and height if not passed', () => {
  const payload = {
    data: {},
    document
  }
  const source = 'http://test.example.com/htmlResource'
  const resource = createHtmlResource(source, payload)

  expect(resource).toBeInstanceOf(HTMLDivElement)
  expect(resource.style.width).toBe('')
  expect(resource.style.height).toBe('')
})

test('createHtmlResource returned div must emit load once ready', async () => {
  const htmlFragment = '<div></div>'
  const successResponse = new Response(htmlFragment, {
    headers: {
      'content-type': 'text/html'
    },
    status: 200
  })

  global.fetch = jest.fn(() => Promise.resolve(successResponse))

  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  }
  const source = 'http://test.example.com/htmlResource'
  const resource = createHtmlResource(source, payload)
  const {promise} = waitFor(resource, 'load')

  await promise

  expect(resource.innerHTML).toEqual(htmlFragment)
})

test('createHtmlResource returned div must emit error if there is a problem loading the html', async () => {
  const htmlFragment = '<div></div>'
  const successResponse = new Response(htmlFragment, {
    headers: {
      'content-type': 'text/json'
    },
    status: 200
  })

  global.fetch = jest.fn(() => Promise.resolve(successResponse))

  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  }
  const source = 'http://test.example.com/htmlResource'
  const resource = createHtmlResource(source, payload)
  const {promise} = waitFor(resource, 'error')

  await promise

  expect(resource.innerHTML).toEqual('')
})
