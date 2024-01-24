import debounce from 'lodash.debounce'
import {IntersectionObserver} from './helpers/IntersectionObserver'

type Callback = () => void

const validate = (target: HTMLElement, callback: Callback): void => {
  if (!(target instanceof Element)) {
    throw new TypeError('Target is not an Element node')
  }

  if (!(callback instanceof Function)) {
    throw new TypeError('Callback is not a function')
  }
}

const noop = (): void => {}

const intersectionHandlers = Symbol('intersectionHandlers')
const observerKey = Symbol('intersectionObserver')

interface ObservedHTMLElement extends HTMLElement {
  [intersectionHandlers]?: IntersectionObserverCallback[]
  [observerKey]?: IntersectionObserver
}

const THRESHOLDS_COUNT = 11

const onIntersection = (
  target: ObservedHTMLElement,
  callback: IntersectionObserverCallback
): Callback => {
  if (!target[intersectionHandlers]) {
    target[intersectionHandlers] = []

    const execHandlers = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ): void => {
      target[intersectionHandlers]?.forEach((handler) =>
        handler(entries, observer)
      )
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: [...new Array(THRESHOLDS_COUNT)].map(
        (_item, index) => index / (THRESHOLDS_COUNT - 1)
      )
    }

    target[observerKey] = new IntersectionObserver(execHandlers, options)
    target[observerKey]?.observe(target)
  }

  target[intersectionHandlers]?.push(callback)

  return () => {
    target[intersectionHandlers] = target[intersectionHandlers]?.filter(
      (handler) => handler !== callback
    )

    if (target[intersectionHandlers]?.length === 0) {
      target[observerKey]?.disconnect()

      delete target[intersectionHandlers]
      delete target[observerKey]
    }
  }
}

let visibilityHandlers: Callback[] = []

const onVisibilityChange = (
  _target: HTMLElement,
  callback: Callback
): Callback => {
  const execHandlers = (): void => {
    if (visibilityHandlers) {
      visibilityHandlers.forEach((handler) => handler())
    }
  }

  visibilityHandlers.push(callback)

  if (visibilityHandlers.length === 1) {
    document.addEventListener('visibilitychange', execHandlers)
  }

  return () => {
    visibilityHandlers = visibilityHandlers.filter(
      (handler) => handler !== callback
    )

    if (visibilityHandlers.length === 0) {
      document.removeEventListener('visibilitychange', execHandlers)
    }
  }
}

let lastIntersectionEntries: IntersectionObserverEntry[] = []

/**
 * onElementVisibilityChange callback called whenever the target element change the visibility.
 *
 * @ignore
 * @param isVisible true if the target element is visible and false otherwise.
 */
type VisibilityCallback = (isVisible?: boolean) => void

interface VisibilityObserverOptions {
  /**
   * Sets a debounce threshold for the callback. Defaults to 100 milliseconds.
   */
  threshold?: number
  /**
   * Offset fraction. Percentage of the element that needs to be hidden to be considered not visible.
   * Defaults to 0.4
   */
  viewabilityOffset?: number
}

/**
 * Helper function to know if the visibility of an element has changed.
 *
 * @ignore
 *
 * @param target The element that we want to observe.
 * @param callback The callback that handles the visibility change.
 * @param options Options Map.
 *
 * @returns Unsubscribe function.
 */
export const onElementVisibilityChange = (
  target: HTMLElement,
  callback: VisibilityCallback,
  {threshold = 100, viewabilityOffset = 0.4}: VisibilityObserverOptions = {}
): Callback => {
  validate(target, callback)

  if (!IntersectionObserver) {
    // NOTE: visibility is not determined
    callback(undefined)

    return noop
  }

  let lastIsInViewport = false

  const checkVisibility = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach((entry) => {
      if (entry.target === target) {
        const isInViewport =
          !document.hidden && entry.intersectionRatio > viewabilityOffset

        if (isInViewport !== lastIsInViewport) {
          lastIsInViewport = isInViewport

          callback(isInViewport)
        }
      }
    })
    lastIntersectionEntries = entries
  }

  const visibilityHandler = debounce(checkVisibility, threshold)
  const stopObservingIntersection = onIntersection(target, visibilityHandler)
  const stopListeningToVisibilityChange = onVisibilityChange(target, (): void =>
    visibilityHandler(lastIntersectionEntries)
  )

  return () => {
    stopObservingIntersection()
    stopListeningToVisibilityChange()
  }
}
