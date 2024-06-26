import {trackError, isVastErrorCode, ErrorCode} from '../tracker'
import {requestAd, requestNextAd, type RequestAdOptions} from '../vastRequest'
import {VastError} from '../vastRequest/helpers/vastError'
import {getInteractiveFiles} from '../vastSelectors'
import {VastAdUnit, VpaidAdUnit} from '../adUnit'
import type {
  VastChain,
  Hooks,
  CancelFunction,
  PixelTracker,
  Optional
} from '../types'
import {isIos} from '../utils/isIos'
import {run, type RunOptions} from './run'

const isVpaid = (vastChain: VastChain): boolean =>
  Boolean(vastChain[0].ad && getInteractiveFiles(vastChain[0].ad))

const validateVastChain = (
  vastChain: VastChain,
  options: RunWaterfallOptions
): void => {
  if (!vastChain || vastChain.length === 0) {
    throw new Error('Invalid VastChain')
  }

  const [lastVastResponse] = vastChain

  if (!options.vpaidEnabled && isVpaid(vastChain)) {
    const error = new VastError(
      'VPAID ads are not supported by the current player'
    )

    error.code = ErrorCode.VAST_UNEXPECTED_AD_TYPE
    lastVastResponse.errorCode = ErrorCode.VAST_UNEXPECTED_AD_TYPE
    lastVastResponse.error = error
  }

  if (lastVastResponse.error) {
    throw lastVastResponse.error
  }

  if (typeof options.hooks?.validateVastResponse === 'function') {
    options.hooks.validateVastResponse(vastChain)
  }
}

const callbackHandler =
  (callback?: (...args: any[]) => void) =>
  (...args: any[]): void => {
    if (typeof callback === 'function') {
      callback(...args)
    }
  }

const transformVastResponse = (
  vastChain: VastChain,
  {hooks}: WaterfallOptions
): VastChain => {
  if (typeof hooks?.transformVastResponse === 'function') {
    return hooks.transformVastResponse(vastChain)
  }

  return vastChain
}

const handleVastError = (
  error: VastError,
  vastChain?: VastChain,
  tracker?: PixelTracker
): void => {
  let errorCode = vastChain?.[0]?.errorCode || error?.code

  if (vastChain && errorCode) {
    if (!isVastErrorCode(errorCode)) {
      errorCode = ErrorCode.UNKNOWN_ERROR
    }

    trackError(vastChain, {
      errorCode,
      tracker
    })
  }
}

type WaterfallOptions = Omit<
  RunWaterfallOptions,
  'onAdStart' | 'onError' | 'onRunFinish'
> &
  Required<Pick<RunWaterfallOptions, 'onAdStart' | 'onError' | 'onRunFinish'>>

interface CancelWaterfallOptions {
  isCanceled(): boolean
}

const waterfall = async (
  fetchVastChain: () => Promise<VastChain>,
  placeholder: HTMLElement,
  {isCanceled, ...options}: WaterfallOptions & CancelWaterfallOptions
): Promise<void> => {
  let vastChain: Optional<VastChain>
  let runEpoch!: number
  let adUnit: VastAdUnit | VpaidAdUnit | undefined
  const {onAdStart, onError, onRunFinish} = options

  try {
    if (typeof options.timeout === 'number') {
      runEpoch = Date.now()
    }

    vastChain = await fetchVastChain()

    if (isCanceled()) {
      onRunFinish()

      return
    }

    if (options.timeout && runEpoch) {
      const newEpoch = Date.now()

      options.timeout -= newEpoch - runEpoch
      runEpoch = newEpoch
    }

    validateVastChain(vastChain, options)

    adUnit = await run(transformVastResponse(vastChain, options), placeholder, {
      ...options
    })

    if (isCanceled()) {
      adUnit.cancel()
      onRunFinish()

      return
    }

    adUnit.onError(onError)
    adUnit.onFinish(onRunFinish)
    onAdStart(adUnit)
  } catch (error: any) {
    handleVastError(error, vastChain, options.tracker)

    onError(error, {
      adUnit,
      vastChain
    })

    if (!vastChain || isCanceled()) {
      onRunFinish()

      return
    }

    if (options.timeout && runEpoch) {
      options.timeout -= Date.now() - runEpoch
    }

    if (runEpoch && options.timeout && options.timeout <= 0) {
      onRunFinish()

      return
    }

    waterfall(
      () => requestNextAd(vastChain as VastChain, options),
      placeholder,
      {...options, isCanceled}
    )
  }
}

/**
 * Error data from the ad unit error.
 */
export interface ErrorData {
  /**
   * The {@link VastChain} that caused the error.
   */
  vastChain?: VastChain
  /**
   * Ad unit instance it can be a {@link VastAdUnit} or a {@link VpaidAdUnit}. Will only be added if the vastChain had an ad.
   */
  adUnit?: VastAdUnit | VpaidAdUnit
}

/**
 * Hooks to configure the behaviour of the ad.
 */
export interface RunWaterfallHooks extends Hooks {
  /**
   * If provided it will be called passing the current {@link VastChain} for each valid vast response. Must throw if there is a problem with the vast response. If the Error instance has an `code` number then it will be tracked using the error macros in the Vast response. It will also call {@link runWaterfall~onError} with the thrown error.
   */
  validateVastResponse?(vastChain: VastChain): void
  /**
   * If provided it will be called with the current {@link VastChain} before building the adUnit allowing the modification of the vastResponse if needed.
   */
  transformVastResponse?(vastChain: VastChain): VastChain
}

/**
 * Options map to start one of the ads with {@link runWaterfall}
 */
export interface RunWaterfallOptions extends RunOptions, RequestAdOptions {
  /**
   * If false and it gets a VPAID ad, it will throw an error before starting the ad and continue down in the waterfall. Defaults to `true`.
   */
  vpaidEnabled?: boolean
  /**
   * Will be called once the ad starts with the ad unit.
   *
   * @param adUnit the ad unit instance.
   */
  onAdStart?(adUnit: VastAdUnit | VpaidAdUnit): void
  /**
   * Will be called whenever the an error occurs within the ad unit. It may be called several times with different errors
   *
   * @param error the ad unit error.
   * @param data Data object that will contain.
   */
  onError?(error: Error, data: ErrorData): void
  /**
   * Will be called once the ad run is finished. It will be called no matter how the run was finished (due to an ad complete or an error). It can be used to know when to unmount the component.
   */
  onRunFinish?(): void
  /**
   * Optional map with hooks to configure the behaviour of the ad.
   */
  hooks?: RunWaterfallHooks
}

/**
 * Will try to start one of the ads returned by the `adTag`. It will keep trying until it times out or it runs out of ads.
 *
 * @param adTag The VAST ad tag request url.
 * @param placeholder placeholder element that will contain the video ad.
 * @param options Options Map
 * @returns CancelFunction function. If called it will cancel the ad run. {@link runWaterfall~onRunFinish} will still be called;
 */
export const runWaterfall = (
  adTag: string,
  placeholder: HTMLElement,
  options: RunWaterfallOptions
): CancelFunction => {
  let canceled = false
  let adUnit: VastAdUnit | VpaidAdUnit | undefined
  const isCanceled = (): boolean => canceled
  const onAdStartHandler = callbackHandler(options.onAdStart)
  const onAdStart = (newAdUnit: VastAdUnit | VpaidAdUnit): void => {
    adUnit = newAdUnit
    onAdStartHandler(adUnit)
  }

  const resultOptions: WaterfallOptions = {
    vpaidEnabled: true,
    ...options,
    onAdReady: callbackHandler(options.onAdReady),
    onAdStart,
    onError: callbackHandler(options.onError),
    onRunFinish: callbackHandler(options.onRunFinish)
  }

  // NOTE: It seems that if the video doesn't load synchronously inside a touchend or click event handler, the user gesture breaks on iOS and it won't allow a play.
  const shouldLoad =
    isIos() &&
    options.videoElement?.paused &&
    options.videoElement?.canPlayType('application/vnd.apple.mpegurl')

  if (shouldLoad) {
    options.videoElement?.load()
  }

  waterfall(() => requestAd(adTag, resultOptions), placeholder, {
    ...resultOptions,
    isCanceled
  })

  return (): void => {
    canceled = true

    if (adUnit && !adUnit.isFinished()) {
      adUnit.cancel()
    }
  }
}
