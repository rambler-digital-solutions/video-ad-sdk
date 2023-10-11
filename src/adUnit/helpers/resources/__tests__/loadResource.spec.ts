import loadResource from '../loadResource'
import createResource from '../createResource'

const mockResource = document.createElement('img')

mockResource.classList.add('mock-resource-element')

jest.mock('../createResource', () => jest.fn(() => mockResource))

let icon: any
let placeholder: HTMLElement

beforeEach(() => {
  icon = {
    staticResource: 'http://test.example.com/resource'
  }

  placeholder = document.createElement('div')
})

afterEach(() => {
  icon = null
  ;(placeholder as any) = null
})

test('loadResource must return a promise', async () => {
  const promise = loadResource(icon, {
    document,
    placeholder
  })

  const iconElement = placeholder.querySelector(
    '.mock-resource-element'
  ) as HTMLElement

  expect(iconElement.style.zIndex).toBe('-9999')

  iconElement.dispatchEvent(new Event('load'))

  const loadedIcon = await promise

  expect(loadedIcon).toBe(iconElement)
  expect(loadedIcon.style.zIndex).toBe('0')
  expect(placeholder.querySelector('.mock-resource-element')).toBeNull()
})

test('loadResource must reject the promise if there is a problem loading the icon', async () => {
  expect.assertions(4)

  const promise = loadResource(icon, {
    document,
    placeholder
  })

  const iconElement = placeholder.querySelector(
    '.mock-resource-element'
  ) as HTMLElement

  expect(iconElement.style.zIndex).toBe('-9999')

  try {
    iconElement.dispatchEvent(new Event('error'))
    await promise
  } catch (error: any) {
    expect(error.message).toBe('Error loading resource')
    expect(iconElement.style.zIndex).toBe('0')
    expect(placeholder.querySelector('.mock-resource-element')).toBeNull()
  }
})

test('loadResource must reject the promise if there is a problem creating the resource', () => {
  ;(createResource as jest.Mock).mockImplementation(() => () => {
    throw new Error('boom')
  })

  const promise = loadResource(icon, {
    document,
    placeholder
  })

  expect(placeholder.querySelector('.mock-resource-element')).toBeNull()
  expect(promise).rejects.toBeInstanceOf(Error)
})
