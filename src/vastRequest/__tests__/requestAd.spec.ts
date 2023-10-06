import {parseXml} from '../../xml'
import {ErrorCode} from '../../tracker'
import {getAds, getFirstAd} from '../../vastSelectors'
import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  vastInlineXML,
  vastPodXML,
  wrapperParsedXML,
  inlineParsedXML,
  podParsedXML,
  vastInvalidXML,
  vastInvalidParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures'
import requestAd from '../requestAd'
import {markAdAsRequested, unmarkAdAsRequested} from '../helpers/adUtils'

jest.useFakeTimers()

describe('requestAd', () => {
  test('must return a chain with errorcode 302 if the wrapperLimit is reached', async () => {
    const vastChain = await requestAd(
      'http://adtag.test.example.com',
      {wrapperLimit: 1},
      [{}, {}]
    )
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: null,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_TOO_MANY_REDIRECTS,
      parsedXML: null,
      requestTag: 'http://adtag.test.example.com',
      XML: null
    })
  })

  test('must return a chain with errorcode 302 if the default wrapperLimit is reached', async () => {
    const vastChain = await requestAd('http://adtag.test.example.com', {}, [
      {},
      {},
      {},
      {},
      {},
      {}
    ])
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: null,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_TOO_MANY_REDIRECTS,
      parsedXML: null,
      requestTag: 'http://adtag.test.example.com',
      XML: null
    })
  })

  test('must return a chain with error code 502 if there was an error fetching the ad', async () => {
    const fetchError = new Error('Error doing fetch')

    global.fetch = jest.fn(() => Promise.reject(fetchError))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: null,
      error: fetchError,
      errorCode: ErrorCode.VAST_NONLINEAR_LOADING_FAILED,
      parsedXML: null,
      requestTag: 'http://adtag.test.example.com',
      XML: null
    })
  })

  test('must return a chain with error code 502 if there was an error extracting the text from the response', async () => {
    const noTextError = new Error('No text in the response')
    const response = {
      status: 200,
      text: () => {
        throw noTextError
      }
    }

    global.fetch = jest.fn(() => Promise.resolve(response))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: null,
      error: noTextError,
      errorCode: ErrorCode.VAST_NONLINEAR_LOADING_FAILED,
      parsedXML: null,
      requestTag: 'http://adtag.test.example.com',
      response,
      XML: null
    })
  })

  test('must return a chain with error code 100 if there is a problem parsing the xml', async () => {
    const response = {
      status: 200,
      text: () => 'not xml'
    }

    global.fetch = jest.fn(() => Promise.resolve(response))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: null,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_XML_PARSING_ERROR,
      parsedXML: null,
      requestTag: 'http://adtag.test.example.com',
      response,
      XML: 'not xml'
    })
  })

  test('must return a chain with error 303 if there is no ad in the VAST response', async () => {
    const response = {
      status: 200,
      text: () => vastNoAdXML
    }

    global.fetch = jest.fn(() => Promise.resolve(response))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: null,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_NO_ADS_AFTER_WRAPPER,
      parsedXML: noAdParsedXML,
      requestTag: 'http://adtag.test.example.com',
      response,
      XML: vastNoAdXML
    })
  })

  test('must do do the wrapper chain requests until it finds an inline ad', async () => {
    const wrapperResponse = {
      status: 200,
      text: () => vastWrapperXML
    }

    const inlineResponse = {
      status: 200,
      text: () => vastInlineXML
    }

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(inlineResponse))

    const vastChain = await requestAd('http://adtag.test.example.com', {})

    markAdAsRequested(inlineAd)
    markAdAsRequested(wrapperAd)

    expect(vastChain).toEqual([
      {
        ad: inlineAd,
        errorCode: null,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: inlineResponse,
        XML: vastInlineXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: wrapperResponse,
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'http://adtag.test.example.com',
        response: wrapperResponse,
        XML: vastWrapperXML
      }
    ])

    unmarkAdAsRequested(inlineAd)
    unmarkAdAsRequested(wrapperAd)
  })

  test('must set errorCode 101 if neither wrapper neither inline can be find inside the ad', async () => {
    const invalidVastResponse = {
      status: 200,
      text: () => vastInvalidXML
    }

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(invalidVastResponse))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const ad = getAds(vastInvalidParsedXML)[0]

    markAdAsRequested(ad)

    expect(vastChain).toEqual([
      {
        ad: getAds(vastInvalidParsedXML)[0],
        error: expect.any(Error),
        errorCode: ErrorCode.VAST_SCHEMA_VALIDATION_ERROR,
        parsedXML: vastInvalidParsedXML,
        requestTag: 'http://adtag.test.example.com',
        response: invalidVastResponse,
        XML: vastInvalidXML
      }
    ])
  })

  test('must set errorCode 203 if the allowMultipleAds option is set to false and receives an ad pod', async () => {
    const startChain = [
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'http://adtag.test.example.com',
        XML: vastWrapperXML
      }
    ]

    const podResponse = {
      status: 200,
      text: () => vastPodXML
    }

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(podResponse))

    const vastChain = await requestAd(
      'https://test.example.com/vastadtaguri',
      {allowMultipleAds: false},
      startChain
    )
    const firstPodAd = getFirstAd(podParsedXML)

    markAdAsRequested(firstPodAd)

    expect(vastChain).toEqual([
      {
        ad: firstPodAd,
        error: expect.any(Error),
        errorCode: ErrorCode.VAST_UNEXPECTED_MEDIA_FILE,
        parsedXML: podParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: podResponse,
        XML: vastPodXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'http://adtag.test.example.com',
        XML: vastWrapperXML
      }
    ])
  })

  test('must set errorCode 203 if the wrapper comes with allowMultipleAds is set to false and receives an ad pod', async () => {
    const newWrapperXML = vastWrapperXML.replace(
      'allowMultipleAds="true"',
      'allowMultipleAds="false"'
    )
    const parsedWrapperXML = parseXml(newWrapperXML)
    const newWrapperAd = getFirstAd(parsedWrapperXML)
    const wrapperResponse = {
      status: 200,
      text: () => newWrapperXML
    }

    const podResponse = {
      status: 200,
      text: () => vastPodXML
    }

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(podResponse))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const firstPodAd = getFirstAd(podParsedXML)

    markAdAsRequested(firstPodAd)
    markAdAsRequested(newWrapperAd)

    expect(vastChain).toEqual([
      {
        ad: firstPodAd,
        error: expect.any(Error),
        errorCode: ErrorCode.VAST_UNEXPECTED_MEDIA_FILE,
        parsedXML: podParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: podResponse,
        XML: vastPodXML
      },
      {
        ad: newWrapperAd,
        errorCode: null,
        parsedXML: parsedWrapperXML,
        requestTag: 'http://adtag.test.example.com',
        response: wrapperResponse,
        XML: newWrapperXML
      }
    ])
  })

  test('must set errorCode 200 if the wrapper comes with followAdditionalWrappers  set to false and receives a wrapper', async () => {
    const newWrapperXML = vastWrapperXML.replace(
      'allowMultipleAds="true"',
      'followAdditionalWrappers="false"'
    )
    const parsedWrapperXML = parseXml(newWrapperXML)
    const newWrapperAd = getFirstAd(parsedWrapperXML)
    const wrapperResponse = {
      status: 200,
      text: () => newWrapperXML
    }

    const anotherWrapperResponse = {
      status: 200,
      text: () => vastWrapperXML
    }

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(anotherWrapperResponse))

    const vastChain = await requestAd('http://adtag.test.example.com', {})

    markAdAsRequested(newWrapperAd)
    markAdAsRequested(wrapperAd)

    expect(vastChain).toEqual([
      {
        ad: wrapperAd,
        error: expect.any(Error),
        errorCode: ErrorCode.VAST_UNEXPECTED_AD_TYPE,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: anotherWrapperResponse,
        XML: vastWrapperXML
      },
      {
        ad: newWrapperAd,
        errorCode: null,
        parsedXML: parsedWrapperXML,
        requestTag: 'http://adtag.test.example.com',
        response: wrapperResponse,
        XML: newWrapperXML
      }
    ])
  })

  describe('with timeout', () => {
    let origDateNow

    beforeEach(() => {
      origDateNow = Date.now
      Date.now = jest.fn()
    })

    afterEach(() => {
      Date.now = origDateNow
    })

    test('must update the timeout for each wrapper chain', async () => {
      setTimeout.mockClear()

      const wrapperResponse = {
        status: 200,
        text: () => vastWrapperXML
      }

      const inlineResponse = {
        status: 200,
        text: () => vastInlineXML
      }

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
        .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
        .mockImplementationOnce(() => Promise.resolve(inlineResponse))

      Date.now.mockReturnValueOnce(1000)
      Date.now.mockReturnValueOnce(1100)
      Date.now.mockReturnValueOnce(1200)
      Date.now.mockReturnValueOnce(1300)

      const vastChain = await requestAd('http://adtag.test.example.com', {
        timeout: 1000
      })

      markAdAsRequested(inlineAd)
      markAdAsRequested(wrapperAd)

      expect(vastChain).toEqual([
        {
          ad: inlineAd,
          errorCode: null,
          parsedXML: inlineParsedXML,
          requestTag: 'https://test.example.com/vastadtaguri',
          response: inlineResponse,
          XML: vastInlineXML
        },
        {
          ad: wrapperAd,
          errorCode: null,
          parsedXML: wrapperParsedXML,
          requestTag: 'https://test.example.com/vastadtaguri',
          response: wrapperResponse,
          XML: vastWrapperXML
        },
        {
          ad: wrapperAd,
          errorCode: null,
          parsedXML: wrapperParsedXML,
          requestTag: 'http://adtag.test.example.com',
          response: wrapperResponse,
          XML: vastWrapperXML
        }
      ])

      expect(setTimeout).toHaveBeenCalledTimes(3)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 900)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 800)

      unmarkAdAsRequested(inlineAd)
      unmarkAdAsRequested(wrapperAd)
    })

    test('must set errorCode 301 if the request timed out', async () => {
      setTimeout.mockClear()
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => new Promise(() => {}))

      Date.now.mockReturnValueOnce(1000)
      Date.now.mockReturnValueOnce(1100)

      const vastChainPromise = requestAd('http://adtag.test.example.com', {
        timeout: 1000
      })

      jest.runOnlyPendingTimers()

      const vastChain = await vastChainPromise

      expect(vastChain).toEqual([
        {
          ad: null,
          error: expect.any(Error),
          errorCode: ErrorCode.VAST_LOAD_TIMEOUT,
          parsedXML: null,
          requestTag: 'http://adtag.test.example.com',
          XML: null
        }
      ])

      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000)
    })
  })
})
