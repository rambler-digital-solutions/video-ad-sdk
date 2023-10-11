import {getAds} from '../../vastSelectors'
import {
  vastWrapperXML,
  vastInlineXML,
  vastWaterfallXML,
  wrapperParsedXML,
  inlineParsedXML,
  waterfallParsedXML,
  waterfallWithInlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures'
import requestNextAd from '../requestNextAd'
import {markAdAsRequested, unmarkAdAsRequested} from '../helpers/adUtils'

test('requestNextAd must throw if we pass an invalid VAST chain', () => {
  expect(() => (requestNextAd as any)()).toThrowError('Invalid VAST chain')
  expect(() => (requestNextAd as any)()).toThrowError(TypeError)
})

test('requestNexAd must return the next inline to play in the waterfall', async () => {
  const waterfallAds = getAds(waterfallWithInlineParsedXML)
  const VASTWaterfallChain = [
    {
      ad: inlineAd,
      parsedXML: inlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[0],
      parsedXML: waterfallWithInlineParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ]

  markAdAsRequested(inlineAd)
  markAdAsRequested(wrapperAd)
  markAdAsRequested(waterfallAds[0])

  const vastChain = await requestNextAd(VASTWaterfallChain, {})

  expect(vastChain).toEqual([
    {
      ad: waterfallAds[1],
      parsedXML: waterfallWithInlineParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ])

  unmarkAdAsRequested(inlineAd)
  unmarkAdAsRequested(wrapperAd)
  unmarkAdAsRequested(waterfallAds[0])
})

test('requestNextAd must request the next ad on the waterfall', async () => {
  const waterfallAds = getAds(waterfallParsedXML)
  const VASTWaterfallChain = [
    {
      ad: inlineAd,
      parsedXML: inlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastInlineXML
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
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[0],
      parsedXML: waterfallParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ]

  const wrapperResponse = new Response(vastWrapperXML, {
    status: 200,
  })

  const inlineResponse = new Response(vastInlineXML, {
    status: 200,
  })

  const nextWrapperResponse = wrapperResponse.clone()
  const nextInlineResponse = inlineResponse.clone()

  global.fetch = jest
    .fn()
    .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
    .mockImplementationOnce(() => Promise.resolve(inlineResponse))
    .mockImplementationOnce(() => Promise.resolve(nextWrapperResponse))
    .mockImplementationOnce(() => Promise.resolve(nextInlineResponse))

  markAdAsRequested(inlineAd)
  markAdAsRequested(wrapperAd)
  markAdAsRequested(waterfallAds[0])

  let vastChain = await requestNextAd(VASTWaterfallChain, {})

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
      response: wrapperResponse,
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[1],
      parsedXML: waterfallParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ])

  vastChain = await requestNextAd(vastChain, {})

  expect(vastChain).toEqual([
    {
      ad: inlineAd,
      parsedXML: inlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      response: nextInlineResponse,
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      response: nextWrapperResponse,
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[2],
      parsedXML: waterfallParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ])

  unmarkAdAsRequested(inlineAd)
  unmarkAdAsRequested(wrapperAd)
  unmarkAdAsRequested(waterfallAds[0])
})

test('requestNextAd must throw an error if there are no more ads to play in the waterfall', () => {
  markAdAsRequested(inlineAd)
  markAdAsRequested(wrapperAd)

  const VastChain = [
    {
      ad: inlineAd,
      parsedXML: inlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastInlineXML
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
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastWrapperXML
    }
  ]

  expect(() => requestNextAd(VastChain, {})).toThrowError(
    'No next ad to request'
  )
  expect(() => requestNextAd(VastChain, {})).toThrowError(Error)

  unmarkAdAsRequested(inlineAd)
  unmarkAdAsRequested(wrapperAd)
})
