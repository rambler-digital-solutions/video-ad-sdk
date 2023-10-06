import once from './once'

interface WaitFor<T> {
  cancel(): void
  promise: Promise<T>
}

const waitFor = <T extends any[]>(
  element: HTMLElement,
  event: string
): WaitFor<T> => {
  let pending = true
  let resolvePromise: (result: T) => void
  let rejectPromise: (error: Error) => void
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  const cancelOnce = once(element, event, (...args) => {
    pending = false
    resolvePromise(args as T)
  })
  const cancel = (): void => {
    if (pending) {
      pending = false
      cancelOnce()
      rejectPromise(new Error('waitFor was canceled'))
    }
  }

  return {
    cancel,
    promise
  }
}

export default waitFor
