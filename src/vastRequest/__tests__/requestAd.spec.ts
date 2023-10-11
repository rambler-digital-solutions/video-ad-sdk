import {parseXml} from '../../xml'
import {ErrorCode} from '../../tracker'
import {ParsedAd} from '../../types'
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

describe('requestAd', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(global, 'setTimeout')
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('must return a chain with errorcode 302 if the wrapperLimit is reached', async () => {
    const vastChain = await requestAd(
      'http://adtag.test.example.com',
      {wrapperLimit: 1},
      [{}, {}] as any
    )
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: undefined,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_TOO_MANY_REDIRECTS,
      parsedXML: undefined,
      requestTag: 'http://adtag.test.example.com',
      XML: undefined
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
    ] as any)
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: undefined,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_TOO_MANY_REDIRECTS,
      parsedXML: undefined,
      requestTag: 'http://adtag.test.example.com',
      XML: undefined
    })
  })

  test('must return a chain with error code 502 if there was an error fetching the ad', async () => {
    const fetchError = new Error('Error doing fetch')

    global.fetch = jest.fn(() => Promise.reject(fetchError))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: undefined,
      error: fetchError,
      errorCode: ErrorCode.VAST_NONLINEAR_LOADING_FAILED,
      parsedXML: undefined,
      requestTag: 'http://adtag.test.example.com',
      XML: undefined
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

    global.fetch = jest.fn(() => Promise.resolve(response as unknown as Response))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: undefined,
      error: noTextError,
      errorCode: ErrorCode.VAST_NONLINEAR_LOADING_FAILED,
      parsedXML: undefined,
      requestTag: 'http://adtag.test.example.com',
      response,
      XML: undefined
    })
  })

  test('must return a chain with error code 100 if there is a problem parsing the xml', async () => {
    const response = new Response('not xml', {
      status: 200,
    })

    global.fetch = jest.fn(() => Promise.resolve(response))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: undefined,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_XML_PARSING_ERROR,
      parsedXML: undefined,
      requestTag: 'http://adtag.test.example.com',
      response,
      XML: 'not xml'
    })
  })

  test('must return a chain with error 303 if there is no ad in the VAST response', async () => {
    const response = new Response(vastNoAdXML, {
      status: 200,
    })

    global.fetch = jest.fn(() => Promise.resolve(response))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const lastVastResponse = vastChain[0]

    expect(lastVastResponse).toEqual({
      ad: undefined,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_NO_ADS_AFTER_WRAPPER,
      parsedXML: noAdParsedXML,
      requestTag: 'http://adtag.test.example.com',
      response,
      XML: vastNoAdXML
    })
  })

  test('must do do the wrapper chain requests until it finds an inline ad', async () => {
    const wrapperResponse = new Response( vastWrapperXML, {
      status: 200,
    })

    const middleWrapperResponse = wrapperResponse.clone()

    const inlineResponse = new Response(vastInlineXML, {
      status: 200,
    })

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(middleWrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(inlineResponse))

    const vastChain = await requestAd('http://adtag.test.example.com', {})

    markAdAsRequested(inlineAd)
    markAdAsRequested(wrapperAd)

    expect(vastChain).toEqual([
      {
        ad: inlineAd,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: inlineResponse,
        XML: vastInlineXML
      },
      {
        ad: wrapperAd,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        response: middleWrapperResponse,
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
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
    const invalidVastResponse = new Response(vastInvalidXML, {
      status: 200,
    })

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
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
        parsedXML: wrapperParsedXML,
        requestTag: 'http://adtag.test.example.com',
        XML: vastWrapperXML
      }
    ]

    const podResponse = new Response(vastPodXML, {
      status: 200,
    })

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(podResponse))

    const vastChain = await requestAd(
      'https://test.example.com/vastadtaguri',
      {allowMultipleAds: false},
      startChain
    )
    const firstPodAd = getFirstAd(podParsedXML) as ParsedAd

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
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
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
    const newWrapperAd = getFirstAd(parsedWrapperXML) as ParsedAd
    const wrapperResponse = new Response(newWrapperXML, {
      status: 200,
    })

    const podResponse = new Response(vastPodXML, {
      status: 200,
    })

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
      .mockImplementationOnce(() => Promise.resolve(podResponse))

    const vastChain = await requestAd('http://adtag.test.example.com', {})
    const firstPodAd = getFirstAd(podParsedXML) as ParsedAd

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
    const newWrapperAd = getFirstAd(parsedWrapperXML) as ParsedAd
    const wrapperResponse = new Response(newWrapperXML, {
      status: 200,
    })

    const anotherWrapperResponse = new Response(vastWrapperXML, {
      status: 200,
    })

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
        parsedXML: parsedWrapperXML,
        requestTag: 'http://adtag.test.example.com',
        response: wrapperResponse,
        XML: newWrapperXML
      }
    ])
  })

  describe('with timeout', () => {
    let origDateNow: typeof Date.now

    beforeEach(() => {
      origDateNow = Date.now
      Date.now = jest.fn()
    })

    afterEach(() => {
      Date.now = origDateNow
    })

    test('must update the timeout for each wrapper chain', async () => {
      ;(setTimeout as unknown as jest.Mock).mockClear()

      const wrapperResponse = new Response(vastWrapperXML, {
        status: 200,
      })

      const middleWrapperResponse = wrapperResponse.clone()

      const inlineResponse = new Response(vastInlineXML, {
        status: 200,
      })

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
        .mockImplementationOnce(() => Promise.resolve(middleWrapperResponse))
        .mockImplementationOnce(() => Promise.resolve(inlineResponse))

      ;(Date.now as jest.Mock).mockReturnValueOnce(1000)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1100)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1200)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1300)

      const vastChain = await requestAd('http://adtag.test.example.com', {
        timeout: 1000
      })

      markAdAsRequested(inlineAd)
      markAdAsRequested(wrapperAd)

      expect(vastChain).toEqual([
        {
          ad: inlineAd,
          parsedXML: inlineParsedXML,
          requestTag: 'https://test.example.com/vastadtaguri',
          response: inlineResponse,
          XML: vastInlineXML
        },
        {
          ad: wrapperAd,
          parsedXML: wrapperParsedXML,
          requestTag: 'https://test.example.com/vastadtaguri',
          response: middleWrapperResponse,
          XML: vastWrapperXML
        },
        {
          ad: wrapperAd,
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
      ;(setTimeout as unknown as jest.Mock).mockClear()

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() => new Promise(() => {}))

      ;(Date.now as jest.Mock).mockReturnValueOnce(1000)
      ;(Date.now as jest.Mock).mockReturnValueOnce(1100)

      const vastChainPromise = requestAd('http://adtag.test.example.com', {
        timeout: 1000
      })

      jest.runOnlyPendingTimers()

      const vastChain = await vastChainPromise

      expect(vastChain).toEqual([
        {
          ad: undefined,
          error: expect.any(Error),
          errorCode: ErrorCode.VAST_LOAD_TIMEOUT,
          parsedXML: undefined,
          requestTag: 'http://adtag.test.example.com',
          XML: undefined
        }
      ])

      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000)
    })
  })
})
