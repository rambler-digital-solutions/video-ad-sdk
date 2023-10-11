import {
  inlineAd,
  inlineParsedXML,
  legacyVpaidInlineAd,
  podParsedXML,
  vpaidInlineAd,
  wrapperAd,
  vastWrapperXML,
  vastVpaidInlineXML,
  wrapperParsedXML,
  noAdParsedXML
} from '../../../fixtures'
import {
  getAds,
  getCreativeData,
  getAdErrorURI,
  getClickThrough,
  getClickTracking,
  getCustomClick,
  getFirstAd,
  getImpression,
  getViewable,
  getNotViewable,
  getViewUndetermined,
  getInteractiveCreativeFiles,
  getInteractiveFiles,
  getLinearTrackingEvents,
  getMediaFiles,
  getSkipOffset,
  getVASTAdTagURI,
  getVastErrorURI,
  getWrapperOptions,
  hasAdPod,
  getPodAdSequence,
  isPodAd,
  isInline,
  isWrapper
} from '../'
import {
  ParsedXML,
  ParsedAd,
  Attributes,
  MediaFile,
  InteractiveFile
} from '../../types'

const clone = <T extends Record<string, any>>(obj: T): T =>
  JSON.parse(JSON.stringify(obj))

test('getVastErrorURI must return the error uri of the VAST element', () => {
  expect(getVastErrorURI(inlineParsedXML)).toBeUndefined()
  expect(getVastErrorURI(noAdParsedXML)).toEqual([
    'https://test.example.com/error/[ERRORCODE]',
    'https://test.example.com/error2/[ERRORCODE]'
  ])
  expect(getVastErrorURI(undefined as unknown as ParsedXML)).toBeUndefined()
  expect(getVastErrorURI({} as ParsedXML)).toBeUndefined()
})

test('getAds must return the ads of the passed adResponse or undefined otherwise', () => {
  expect(getAds(wrapperParsedXML)).toEqual([wrapperAd])
  expect(getAds(noAdParsedXML)).toEqual([])
  expect(getAds({} as ParsedXML)).toEqual([])
  expect(getAds(undefined as unknown as ParsedXML)).toEqual([])
})

test('getFirstAd must return the first ad of the passed adResponse or undefined otherwise', () => {
  expect(getFirstAd(wrapperParsedXML)).toEqual(wrapperAd)
  expect(getFirstAd({} as ParsedXML)).toBeUndefined()
})

test('getFirsAd must return the firs ad in the sequence if the passed VAST has an ad pod', () => {
  const ad = getFirstAd(podParsedXML)

  expect(ad?.attributes?.id).toBe('1234')
})

test('isWrapper must return true if the ad contains a wrapper and false otherwise', () => {
  expect(isWrapper(wrapperAd)).toBe(true)
  expect(isWrapper(inlineAd)).toBe(false)
  expect(isWrapper({} as ParsedAd)).toBe(false)
  expect(isWrapper(undefined as unknown as ParsedAd)).toBe(false)
  expect(isWrapper(1 as unknown as ParsedAd)).toBe(false)
})

test('isInline must return true if the ad contains a wrapper and false otherwise', () => {
  expect(isInline(inlineAd)).toBe(true)
  expect(isInline(wrapperAd)).toBe(false)
  expect(isInline({} as ParsedAd)).toBe(false)
  expect(isInline(undefined as unknown as ParsedAd)).toBe(false)
  expect(isInline(1 as unknown as ParsedAd)).toBe(false)
})

test('getVASTAdTagURI must return the VASTAdTagURI from the wrapper ad or undefined otherwise', () => {
  expect(getVASTAdTagURI(wrapperAd)).toBe(
    'https://test.example.com/vastadtaguri'
  )
  expect(getVASTAdTagURI(inlineAd)).toBeUndefined()
})

test('hasAdPod must return true if the passed ads have an ad pod and false otherwise', () => {
  expect(hasAdPod(podParsedXML)).toBe(true)
  expect(hasAdPod(inlineParsedXML)).toBe(false)
  expect(hasAdPod({} as ParsedAd)).toBe(false)
  expect(hasAdPod(undefined as unknown as ParsedAd)).toBe(false)
})

test('hasAdPod must return false if the there is only one ad with a sequence', () => {
  const podAds = getAds(podParsedXML)

  if (podParsedXML.elements) podParsedXML.elements[0].elements = [podAds[1]]

  expect(hasAdPod(podParsedXML)).toBe(false)

  if (podParsedXML.elements) podParsedXML.elements[0].elements = podAds
})

test('getPodAdSequence mus return the sequence of the ad or false otherwise', () => {
  const ads = getAds(podParsedXML)

  expect(getPodAdSequence(ads[0])).toBeUndefined()
  expect(getPodAdSequence(ads[1])).toBe(1)
})

test('isPodAd must return true if the ad has a sequence and false otherwise', () => {
  const ads = getAds(podParsedXML)

  expect(isPodAd(ads[0])).toBe(false)
  expect(isPodAd(ads[1])).toBe(true)
})

test('getWrapperOptions must return the options of the ad or {} otherwise', () => {
  expect(getWrapperOptions(inlineAd)).toEqual({})
  expect(getWrapperOptions(wrapperAd)).toEqual({allowMultipleAds: true})

  const wrapperAdClone = clone<ParsedXML>(wrapperAd)
  const wrapperAttrs = wrapperAdClone.elements?.[0].attributes as Attributes

  wrapperAttrs.allowMultipleAds = 'false'

  expect(getWrapperOptions(wrapperAdClone)).toEqual({allowMultipleAds: false})

  wrapperAttrs.allowMultipleAds = 'true'
  wrapperAttrs.followAdditionalWrappers = 'false'

  expect(getWrapperOptions(wrapperAdClone)).toEqual({
    allowMultipleAds: true,
    followAdditionalWrappers: false
  })

  wrapperAttrs.fallbackOnNoAd = 'true'

  expect(getWrapperOptions(wrapperAdClone)).toEqual({
    allowMultipleAds: true,
    fallbackOnNoAd: true,
    followAdditionalWrappers: false
  })
})

test('getAdErrorURI must return the error uri of the inline/wrapper or undefined if missing', () => {
  expect(getAdErrorURI(inlineAd)).toEqual(['https://test.example.com/error'])
  expect(getAdErrorURI(wrapperAd)).toEqual([
    'https://test.example.com/error/[ERRORCODE]'
  ])
  expect(getAdErrorURI(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getAdErrorURI({} as ParsedAd)).toBeUndefined()
})

test('getImpression must return the imression uri of the inline/wrapper or undefined if missing', () => {
  expect(getImpression(inlineAd)).toEqual([
    'https://test.example.com/impression'
  ])
  expect(getImpression(wrapperAd)).toEqual([
    'https://test.example.com/impression'
  ])
  expect(getImpression(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getImpression({} as ParsedAd)).toBeUndefined()
})

test('getViewable must return the viewable uri of the inline/wrapper or undefined if missing', () => {
  expect(getViewable(inlineAd)).toEqual(['https://test.example.com/viewable'])
  expect(getViewable(wrapperAd)).toBeUndefined()
  expect(getViewable(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getViewable({} as ParsedAd)).toBeUndefined()
})

test('getNotViewable must return the not visible uri of the inline/wrapper or undefined if missing', () => {
  expect(getNotViewable(inlineAd)).toEqual([
    'https://test.example.com/notViewable'
  ])
  expect(getNotViewable(wrapperAd)).toBeUndefined()
  expect(getNotViewable(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getNotViewable({} as ParsedAd)).toBeUndefined()
})

test('getViewUndetermined must return the undetermined view uri of the inline/wrapper or undetermined if missing', () => {
  expect(getViewUndetermined(inlineAd)).toEqual([
    'https://test.example.com/notDetermined'
  ])
  expect(getViewUndetermined(wrapperAd)).toBeUndefined()
  expect(getViewUndetermined(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getViewUndetermined({} as ParsedAd)).toBeUndefined()
})

test('getMediaFiles must return undefined for wrong ads', () => {
  expect(getMediaFiles(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getMediaFiles({} as ParsedAd)).toBeUndefined()
  expect(getMediaFiles(wrapperAd)).toBeUndefined()
})

test('getMediaFiles must return the mediafiles', () => {
  const mediaFiles = getMediaFiles(inlineAd) as MediaFile[]

  expect(mediaFiles).toBeInstanceOf(Array)
  expect(mediaFiles.length).toBe(3)
  expect(mediaFiles[0]).toEqual({
    bitrate: '600',
    codec: undefined,
    delivery: 'progressive',
    height: '1080',
    id: undefined,
    maintainAspectRatio: 'true',
    maxBitrate: undefined,
    minBitrate: undefined,
    scalable: 'true',
    src: 'https://test.example.com/test1920x1080.mp4',
    type: 'video/mp4',
    universalAdId: '8465',
    width: '1920'
  })
})

test('getMediaFiles must add the apiFramework if present', () => {
  const mediaFiles = getMediaFiles(vpaidInlineAd) as MediaFile[]

  expect(mediaFiles).toBeInstanceOf(Array)
  expect(mediaFiles.length).toBe(2)
  expect(mediaFiles[0]).toEqual(
    expect.objectContaining({
      apiFramework: 'VPAID',
      src: 'https://test.example.com/html5.js',
      type: 'text/javascript'
    })
  )
})

test('getInteractiveCreativeFiles must return undefined for wrong ads', () => {
  expect(
    getInteractiveCreativeFiles(undefined as unknown as ParsedAd)
  ).toBeUndefined()
  expect(getInteractiveCreativeFiles({} as ParsedAd)).toBeUndefined()
  expect(getInteractiveCreativeFiles(wrapperAd)).toBeUndefined()
})

test('getInteractiveCreativeFiles must return the mediafiles', () => {
  const interactiveFiles = getInteractiveCreativeFiles(
    vpaidInlineAd
  ) as InteractiveFile[]

  expect(interactiveFiles).toBeInstanceOf(Array)
  expect(interactiveFiles.length).toBe(2)
  expect(interactiveFiles[0]).toEqual({
    apiFramework: 'VPAID',
    src: 'https://test.example.com/html5.js',
    type: 'text/javascript'
  })
  expect(interactiveFiles[1]).toEqual({
    apiFramework: 'VPAID',
    src: 'https://test.example.com/flash.swf',
    type: 'application/x-shockwave-flash'
  })
})

test('getLinearTrackingEvents must return undefined if there are no linear tracking events', () => {
  expect(
    getLinearTrackingEvents(undefined as unknown as ParsedAd)
  ).toBeUndefined()
  expect(getLinearTrackingEvents({} as ParsedAd)).toBeUndefined()
  expect(getLinearTrackingEvents(noAdParsedXML)).toBeUndefined()
})

test('getLinearTrackingEvents must return the linear tracking events', () => {
  expect(getLinearTrackingEvents(inlineAd)).toEqual([
    {
      event: 'creativeView',
      offset: undefined,
      uri: 'https://test.example.com/creativeView'
    },
    {
      event: 'start',
      offset: undefined,
      uri: 'https://test.example.com/start'
    },
    {
      event: 'closeLinear',
      offset: undefined,
      uri: 'https://test.example.com/closeLinear'
    },
    {
      event: 'midpoint',
      offset: undefined,
      uri: 'https://test.example.com/midpoint'
    },
    {
      event: 'firstQuartile',
      offset: undefined,
      uri: 'https://test.example.com/firstQuartile'
    },
    {
      event: 'thirdQuartile',
      offset: undefined,
      uri: 'https://test.example.com/thirdQuartile'
    },
    {
      event: 'complete',
      offset: undefined,
      uri: 'https://test.example.com/complete'
    },
    {
      event: 'timeSpentViewing',
      offset: 5000,
      uri: 'https://test.example.com/timeSpentViewing'
    },
    {
      event: 'timeSpentViewing',
      offset: '15%',
      uri: 'https://test.example.com/timeSpentViewing2'
    }
  ])

  expect(getLinearTrackingEvents(wrapperAd)).toEqual([
    {
      event: 'start',
      offset: undefined,
      uri: 'https://test.example.com/start'
    },
    {
      event: 'start',
      offset: undefined,
      uri: 'https://test.example.com/start2'
    },
    {
      event: 'firstQuartile',
      offset: undefined,
      uri: 'https://test.example.com/firstQuartile'
    },
    {
      event: 'firstQuartile',
      offset: undefined,
      uri: 'https://test.example.com/firstQuartile2'
    },
    {
      event: 'midpoint',
      offset: undefined,
      uri: 'https://test.example.com/midpoint'
    },
    {
      event: 'midpoint',
      offset: undefined,
      uri: 'https://test.example.com/midpoint2'
    },
    {
      event: 'thirdQuartile',
      offset: undefined,
      uri: 'https://test.example.com/thirdQuartile'
    },
    {
      event: 'thirdQuartile',
      offset: undefined,
      uri: 'https://test.example.com/thirdQuartile2'
    },
    {
      event: 'closeLinear',
      offset: undefined,
      uri: 'https://test.example.com/closeLinear2'
    },
    {
      event: 'complete',
      offset: undefined,
      uri: 'https://test.example.com/complete'
    },
    {
      event: 'complete',
      offset: undefined,
      uri: 'https://test.example.com/complete2'
    },
    {
      event: 'playerExpand',
      offset: undefined,
      uri: 'https://test.example.com/playerExpand'
    },
    {
      event: 'playerExpand',
      offset: undefined,
      uri: 'https://test.example.com/playerExpand2'
    },
    {
      event: 'playerCollapse',
      offset: undefined,
      uri: 'https://test.example.com/playerCollapse'
    },
    {
      event: 'playerCollapse',
      offset: undefined,
      uri: 'https://test.example.com/playerCollapse2'
    },
    {
      event: 'mute',
      offset: undefined,
      uri: 'https://test.example.com/mute'
    },
    {
      event: 'mute',
      offset: undefined,
      uri: 'https://test.example.com/mute2'
    },
    {
      event: 'unmute',
      offset: undefined,
      uri: 'https://test.example.com/unmute'
    },
    {
      event: 'unmute',
      offset: undefined,
      uri: 'https://test.example.com/unmute2'
    },
    {
      event: 'rewind',
      offset: undefined,
      uri: 'https://test.example.com/rewind'
    },
    {
      event: 'rewind',
      offset: undefined,
      uri: 'https://test.example.com/rewind2'
    },
    {
      event: 'skip',
      offset: undefined,
      uri: 'https://test.example.com/skip'
    },
    {
      event: 'skip',
      offset: undefined,
      uri: 'https://test.example.com/skip2'
    },
    {
      event: 'pause',
      offset: undefined,
      uri: 'https://test.example.com/pause'
    },
    {
      event: 'pause',
      offset: undefined,
      uri: 'https://test.example.com/pause2'
    },
    {
      event: 'progress',
      offset: 5000,
      uri: 'https://test.example.com/progress'
    },
    {
      event: 'progress',
      offset: '15%',
      uri: 'https://test.example.com/progress2'
    },
    {
      event: 'resume',
      offset: undefined,
      uri: 'https://test.example.com/resume'
    },
    {
      event: 'resume',
      offset: undefined,
      uri: 'https://test.example.com/resume2'
    },
    {
      event: 'fullscreen',
      offset: undefined,
      uri: 'https://test.example.com/fullscreen'
    },
    {
      event: 'fullscreen',
      offset: undefined,
      uri: 'https://test.example.com/fullscreen2'
    },
    {
      event: 'creativeView',
      offset: undefined,
      uri: 'https://test.example.com/creativeView'
    },
    {
      event: 'creativeView',
      offset: undefined,
      uri: 'https://test.example.com/creativeView2'
    },
    {
      event: 'exitFullscreen',
      offset: undefined,
      uri: 'https://test.example.com/exitfullscreen'
    },
    {
      event: 'exitFullscreen',
      offset: undefined,
      uri: 'https://test.example.com/exitfullscreen'
    },
    {
      event: 'acceptInvitationLinear',
      offset: undefined,
      uri: 'https://test.example.com/acceptinvitationlinear'
    },
    {
      event: 'acceptInvitationLinear',
      offset: undefined,
      uri: 'https://test.example.com/acceptinvitationlinear2'
    },
    {
      event: 'closeLinear',
      offset: undefined,
      uri: 'https://test.example.com/closelinear'
    },
    {
      event: 'closeLinear',
      offset: undefined,
      uri: 'https://test.example.com/closelinear'
    }
  ])
})

test('getLinearTrackingEvents must return undefined if you filter by event and are no tracking events after filtering', () => {
  expect(getLinearTrackingEvents(inlineAd, 'progress')).toBeUndefined()
})

test('getLinearTrackingEvents must return the linear progress events if you filter by progress', () => {
  expect(getLinearTrackingEvents(wrapperAd, 'progress')).toEqual([
    {
      event: 'progress',
      offset: 5000,
      uri: 'https://test.example.com/progress'
    },
    {
      event: 'progress',
      offset: '15%',
      uri: 'https://test.example.com/progress2'
    }
  ])
})

test('getClickThrough must return undefined if there is none', () => {
  expect(getClickThrough(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getClickThrough({} as ParsedAd)).toBeUndefined()
  expect(getClickThrough(wrapperAd)).toBeUndefined()
})

test('getClickThrough must return the clickThrough uri', () => {
  expect(getClickThrough(inlineAd)).toEqual(
    'https://test.example.com/clickthrough'
  )
})

test('getClickTracking must return undefined if there is none', () => {
  expect(getClickTracking(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getClickTracking({} as ParsedAd)).toBeUndefined()
})

test('getClickTracking must return the clickThrough uri', () => {
  expect(getClickTracking(inlineAd)).toEqual([
    'https://test.example.com/clicktracking'
  ])
  expect(getClickTracking(wrapperAd)).toEqual([
    'https://test.example.com/clicktracking'
  ])
})

test('getCustomClick must return undefined if there is none', () => {
  expect(getCustomClick(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getCustomClick({} as ParsedAd)).toBeUndefined()
})

test('getCustomClick must return the clickThrough uri', () => {
  expect(getCustomClick(inlineAd)).toEqual([
    'https://test.example.com/customclick'
  ])
  expect(getCustomClick(wrapperAd)).toEqual([
    'https://test.example.com/customclick'
  ])
})

test('getSkipOffset must return undefined if there none', () => {
  expect(getSkipOffset(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getSkipOffset({} as ParsedAd)).toBeUndefined()
  expect(getSkipOffset(wrapperAd)).toBeUndefined()
})

test('getSkipOffset must return the parsed skipoffset', () => {
  expect(getSkipOffset(inlineAd)).toEqual(5000)
})

test('getInteractiveFiles must return undefined for wrong ads', () => {
  expect(getInteractiveFiles(undefined as unknown as ParsedAd)).toBeUndefined()
  expect(getInteractiveFiles({} as ParsedAd)).toBeUndefined()
  expect(getInteractiveFiles(wrapperAd)).toBeUndefined()
})

test('getInteractiveFiles must return undefined if there is no vpaid ad', () => {
  expect(getInteractiveFiles(inlineAd)).toBeUndefined()
})

test('getInteractiveFiles must return the interactive files', () => {
  const interactiveFiles = getInteractiveFiles(
    vpaidInlineAd
  ) as InteractiveFile[]

  expect(interactiveFiles).toBeInstanceOf(Array)
  expect(interactiveFiles.length).toBe(2)
  expect(interactiveFiles[0]).toEqual({
    apiFramework: 'VPAID',
    src: 'https://test.example.com/html5.js',
    type: 'text/javascript'
  })
  expect(interactiveFiles[1]).toEqual({
    apiFramework: 'VPAID',
    src: 'https://test.example.com/flash.swf',
    type: 'application/x-shockwave-flash'
  })
})

test('getInteractiveFiles must return vast2 interactive files', () => {
  const interactiveFiles = getInteractiveFiles(
    legacyVpaidInlineAd
  ) as InteractiveFile[]

  expect(interactiveFiles).toBeInstanceOf(Array)
  expect(interactiveFiles.length).toBe(2)
  expect(interactiveFiles[0]).toEqual({
    apiFramework: 'VPAID',
    src: 'https://test.example.com/html5.js',
    type: 'text/javascript'
  })
  expect(interactiveFiles[1]).toEqual({
    apiFramework: 'VPAID',
    src: 'https://test.example.com/flash.swf',
    type: 'application/x-shockwave-flash'
  })
})

test('getCreativeData must return the adParameters', () => {
  expect(getCreativeData(vastWrapperXML)).toEqual({
    AdParameters: undefined,
    xmlEncoded: false
  })

  expect(getCreativeData(vastVpaidInlineXML)).toEqual({
    AdParameters: 'AD_PARAMETERS_DATA <![CDATA[nested cdata]]>',
    xmlEncoded: false
  })
})
