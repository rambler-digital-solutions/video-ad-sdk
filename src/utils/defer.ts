interface Deferred<T> {
  resolve(result: T): void
  reject(error: Error): void
  promise: Promise<T>
}

export const defer = <T>(): Deferred<T> => {
  const deferred = {} as Deferred<T>
  const promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  deferred.promise = promise

  return deferred
}
