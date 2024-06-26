import {
  vastInlineXML,
  inlineParsedXML,
  inlineAd,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../../../fixtures'
import type {VastChain} from '../../../../types'
import {VideoAdContainer} from '../../../../adContainer/VideoAdContainer'
import {loadCreative} from '../loadCreative'

describe('loadCreative', () => {
  let vastChain: VastChain
  let vpaidChain: VastChain
  let videoAdContainer: VideoAdContainer

  beforeEach(() => {
    vastChain = [
      {
        ad: inlineAd,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastInlineXML
      }
    ]

    vpaidChain = [
      {
        ad: vpaidInlineAd,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastVpaidInlineXML
      }
    ]
    videoAdContainer = new VideoAdContainer(document.createElement('DIV'))
  })

  test('must throw if the vast chain has no supported vpaidCreative', async () => {
    expect.assertions(2)

    try {
      await loadCreative(vastChain, videoAdContainer)
    } catch (error: any) {
      expect(error).toBeInstanceOf(TypeError)
      expect(error.message).toBe(
        'VastChain does not contain a supported vpaid creative'
      )
    }
  })

  test('must load the creative and return it', async () => {
    const mockVpaidCreative = {
      name: 'VPAID_CREATIVE_MOCK'
    }

    videoAdContainer.addScript = jest.fn()
    ;(videoAdContainer.addScript as jest.Mock).mockReturnValue(
      Promise.resolve('success')
    )
    videoAdContainer.executionContext = {
      getVPAIDAd: () => mockVpaidCreative
    } as any

    const creative = await loadCreative(vpaidChain, videoAdContainer)

    expect(creative).toBe(mockVpaidCreative)
    expect(videoAdContainer.addScript).toHaveBeenCalledTimes(1)
    expect(videoAdContainer.addScript).toHaveBeenCalledWith(
      'https://test.example.com/html5.js',
      {type: 'text/javascript'}
    )
  })
})
