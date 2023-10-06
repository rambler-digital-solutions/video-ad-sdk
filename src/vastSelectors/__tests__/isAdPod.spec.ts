import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  wrapperParsedXML,
  wrapperAd,
  inlineAd,
  inlineParsedXML,
  podParsedXML,
  vastInlineXML,
  vastPodXML
} from '../../../fixtures'
import {ErrorCode} from '../../tracker'
import {getFirstAd, isAdPod} from '../index'

const WRAPPER_TAG = 'http://adtag.test.example.com'
const INLINE_TAG = 'https://test.example.com/vastadtaguri'

test('isAdPod must return true if the passed vastChain has an adPod', () => {
  const adPodVastChain = [
    {
      ad: inlineAd,
      error: null,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: INLINE_TAG,
      XML: vastInlineXML
    },
    {
      ad: getFirstAd(wrapperParsedXML),
      errorCode: null,
      parsedXML: podParsedXML,
      requestTag: WRAPPER_TAG,
      XML: vastPodXML
    }
  ]

  expect(isAdPod(adPodVastChain)).toBe(true)
})

test('isAdPod must return false if the passed vasChain has no adPod', () => {
  const errorVastChain = [
    {
      ad: null,
      error: expect.any(Error),
      errorCode: ErrorCode.VAST_UNEXPECTED_MEDIA_FILE,
      parsedXML: noAdParsedXML,
      requestTag: INLINE_TAG,
      XML: vastNoAdXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: WRAPPER_TAG,
      XML: vastWrapperXML
    }
  ]

  const successVastChain = [
    {
      ad: inlineAd,
      error: null,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: INLINE_TAG,
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: WRAPPER_TAG,
      XML: vastWrapperXML
    }
  ]

  const nullVastChain = [
    {
      ad: null,
      error: null,
      errorCode: null,
      parsedXML: null,
      requestTag: INLINE_TAG,
      XML: ''
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: WRAPPER_TAG,
      XML: vastWrapperXML
    }
  ]

  expect(isAdPod(nullVastChain)).toBe(false)
  expect(isAdPod(errorVastChain)).toBe(false)
  expect(isAdPod(successVastChain)).toBe(false)
})
