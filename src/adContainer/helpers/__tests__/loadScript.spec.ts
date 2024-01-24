import {loadScript} from '../loadScript'

test("loadScript complain if you don't pass a source", () => {
  expect(loadScript).toThrow(TypeError)
})

test('loadScript must return a promise', () => {
  expect(loadScript('http://example.com/script')).toBeInstanceOf(Promise)
})

test('loadScript load the script synchronous by default', () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'

  loadScript(source, {placeholder})

  const script = placeholder.querySelector('script') as HTMLScriptElement

  script.onload?.(undefined as any)

  expect(script.src).toEqual(source)
  expect(script.async).toEqual(false)
  expect(script.defer).toEqual(false)
})

test('loadScript must be able to load script as defer', () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'

  loadScript(source, {
    defer: true,
    placeholder
  })

  const script = placeholder.querySelector('script') as HTMLScriptElement

  expect(script.src).toEqual(source)
  expect(script.async).toEqual(false)
  expect(script.defer).toEqual(true)
})

test('loadScript must be able to load script as async', () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'

  loadScript(source, {
    async: true,
    placeholder
  })

  const script = placeholder.querySelector('script') as HTMLScriptElement

  expect(script.src).toEqual(source)
  expect(script.async).toEqual(true)
  expect(script.defer).toEqual(false)
})

test("loadScript set the type as 'text/javascript' by default", () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'

  loadScript(source, {placeholder})

  const script = placeholder.querySelector('script') as HTMLScriptElement

  expect(script.src).toEqual(source)
  expect(script.type).toEqual('text/javascript')
})

test('loadScript must be able to set a custom type for the script', () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'

  loadScript(source, {
    placeholder,
    type: 'txt/test'
  })

  const script = placeholder.querySelector('script') as HTMLScriptElement

  expect(script.src).toEqual(source)
  expect(script.type).toEqual('txt/test')
})

test('loadScript must add the script to the given placeholder', async () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'
  const promise = loadScript(source, {placeholder})
  const script = placeholder.querySelector('script') as HTMLScriptElement

  script.onload?.(undefined as any)

  expect(await promise).toBe(script)
})

test('loadScript must reject the promise if there is an error loading the script', () => {
  const placeholder = document.createElement('div')
  const source = 'http://example.com/script'
  const promise = loadScript(source, {placeholder})
  const script = placeholder.querySelector('script') as HTMLScriptElement

  script.onerror?.(undefined as any)

  expect(promise).rejects.toEqual(expect.any(URIError))
})

test('loadScript if no document.currentScript must add the script to the document.head', async () => {
  const source = 'http://example.com/script'
  const promise = loadScript(source)
  const scripts = document.head.querySelectorAll('script')
  const script = scripts[scripts.length - 1] as HTMLScriptElement

  script.onload?.(undefined as any)

  expect(await promise).toBe(script)
})
