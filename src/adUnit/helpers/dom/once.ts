import type {CancelFunction} from '../../../types'

export const once = <T extends (...args: any) => any>(
  element: HTMLElement,
  eventName: string,
  listener: T
): CancelFunction => {
  const handler = (...args: unknown[]): void => {
    element.removeEventListener(eventName, handler)

    return listener(...args)
  }

  element.addEventListener(eventName, handler)

  return () => {
    element.removeEventListener(eventName, handler)
  }
}
