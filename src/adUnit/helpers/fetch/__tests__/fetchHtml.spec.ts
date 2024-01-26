import {fetchHtml} from '../fetchHtml'

const CONTENT_TYPES = ['text/plain', 'text/html']

CONTENT_TYPES.forEach((contentType) => {
  test(`fetchHtml must resolve with the html fragment with content-type ${contentType}`, async () => {
    const htmlFragment = '<div></div>'
    const successResponse = new Response(htmlFragment, {
      headers: {
        'content-type': contentType
      },
      status: 200
    })

    global.fetch = jest.fn(() => Promise.resolve(successResponse))

    const response = await fetchHtml('http://example.com')

    expect(response).toEqual(htmlFragment)
  })
})

test("fetchHtml must throw an error if the response's status is above 399", async () => {
  expect.assertions(2)

  const forbiddenResponse = new Response(null, {
    headers: {
      'content-type': 'text/plain'
    },
    status: 403,
    statusText: 'forbidden request'
  })

  global.fetch = jest.fn(() => Promise.resolve(forbiddenResponse))

  try {
    await fetchHtml('http://example.com')
  } catch (error: any) {
    expect(error.message).toBe(forbiddenResponse.statusText)
    expect(error.response).toEqual(forbiddenResponse)
  }
})

test("fetchHtml must throw an error if the response's Content-Type is not valid", async () => {
  expect.assertions(2)

  const htmlFragment = '<div></div>'
  const invalidResponse = new Response(htmlFragment, {
    headers: {
      'content-type': 'text/json'
    },
    status: 200
  })

  global.fetch = jest.fn(() => Promise.resolve(invalidResponse))

  try {
    await fetchHtml('http://example.com')
  } catch (error: any) {
    expect(error.message).toBe(
      'fetchHtml error, invalid Content-Type text/json'
    )
    expect(error.response).toEqual(invalidResponse)
  }
})
