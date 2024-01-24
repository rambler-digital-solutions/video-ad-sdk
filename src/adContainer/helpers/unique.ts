/**
 * unique will create a unique string every time is called, sequentially and namespaced
 *
 * @ignore
 * @param namespace
 */
export const unique = (namespace: string): (() => string) => {
  let count = -1

  return () => `${namespace}_${++count}`
}
