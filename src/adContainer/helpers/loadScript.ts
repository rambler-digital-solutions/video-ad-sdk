/**
 * Options map to load script
 */
export interface LoadScriptOptions {
  /**
   * Type of the script. Defaults to 'text/javascript'.
   */
  type?: string
  /**
   * If "true" the "async" attribute is added to the new script. Defaults to false.
   */
  async?: boolean
  /**
   * If "true" the "defer" attribute is added to the new script. Defaults to false.
   */
  defer?: boolean
  /**
   * Element that should contain the script. Defaults to the parentNode of the currentScript or if missing to document.head.
   */
  placeholder?: HTMLElement
}

/**
 * Loads the script source.
 *
 * @ignore
 * @param src The script source.
 * @param options The allowed options
 */
const loadScript = (
  src: string,
  {async = false, defer = false, type, placeholder}: LoadScriptOptions = {}
): Promise<HTMLScriptElement> => {
  if (!src) {
    throw new TypeError('Missing required "src" parameter')
  }

  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const script = document.createElement('script')
    let scriptPlaceholder: Optional<HTMLElement | Node> = placeholder

    script.type = type ?? 'text/javascript'
    script.async = async
    script.defer = defer
    script.onerror = () =>
      reject(new URIError(`The script ${src} is not accessible.`))
    script.onload = () => resolve(script)

    if (!scriptPlaceholder) {
      scriptPlaceholder = (
        document.currentScript
          ? /* istanbul ignore next */
            document.currentScript.parentNode
          : document.head
      ) as HTMLElement
    }

    script.src = src
    scriptPlaceholder?.appendChild(script)
  })
}

export default loadScript
