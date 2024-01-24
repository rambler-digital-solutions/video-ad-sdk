import {trackError, ErrorCode} from '../tracker'
import {createVideoAdContainer, VideoAdContainer} from '../adContainer'
import {VastAdUnit, VpaidAdUnit} from '../adUnit'
import type {VastChain, PixelTracker, Optional} from '../types'
import {startVideoAd, type StartVideoAdOptions} from './helpers/startVideoAd'

/**
 * Options map to start video ad with {@link run}
 */
export interface RunOptions extends StartVideoAdOptions {
  /**
   * Optional videoElement that will be used to play the ad.
   */
  videoElement?: HTMLVideoElement
  /**
   * Timeout number in milliseconds. If set, the video ad will time out if it doesn't start within the specified time.
   */
  timeout?: number
  /**
   * If provided it will be used to track the VAST events instead of the default {@link PixelTracker}.
   */
  tracker?: PixelTracker
}

/**
 * Will try to start video ad in the passed {@link VastChain} and return the started VideoAdUnit.
 * If there is an error starting the ad or it times out (by throw I mean that it will reject promise with the error).
 *
 * @param vastChain The {@link VastChain} with all the {@link VastResponse}s.
 * @param placeholder Element that will contain the video ad.
 * @param options - Options Map.
 * @returns The video ad unit.
 */
export const run = async (
  vastChain: VastChain,
  placeholder: HTMLElement,
  options: RunOptions
): Promise<VastAdUnit | VpaidAdUnit> => {
  let videoAdContainer: Optional<VideoAdContainer>

  try {
    const {timeout} = options

    videoAdContainer = createVideoAdContainer(placeholder, options.videoElement)

    let adUnitPromise = startVideoAd(vastChain, videoAdContainer, options)

    if (typeof timeout === 'number') {
      let timedOut = false
      let timeoutId: number

      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        timeoutId = window.setTimeout(() => {
          const {tracker} = options

          trackError(vastChain, {
            errorCode: ErrorCode.VAST_MEDIA_LOAD_TIMEOUT,
            tracker
          })
          timedOut = true
          reject(new Error('Timeout while starting the ad'))
        }, options.timeout)
      })

      const waitAdUnit = async (): Promise<VastAdUnit | VpaidAdUnit> => {
        const newAdUnit = await adUnitPromise

        if (timedOut) {
          if (newAdUnit.isStarted()) {
            newAdUnit.cancel()
          }
        } else {
          clearTimeout(timeoutId)
        }

        return newAdUnit
      }

      adUnitPromise = Promise.race([waitAdUnit(), timeoutPromise])
    }

    const adUnit = await adUnitPromise

    adUnit.onFinish(() => {
      videoAdContainer?.destroy()
    })

    return adUnit
  } catch (error) {
    videoAdContainer?.destroy()

    throw error
  }
}
