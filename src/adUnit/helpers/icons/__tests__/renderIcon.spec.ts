import loadResource from '../../resources/loadResource'
import renderIcon from '../renderIcon'
import updateIcon from '../updateIcon'
import canBeRendered from '../canBeRendered'

jest.mock('../../resources/loadResource')
jest.mock('../updateIcon')
jest.mock('../canBeRendered')

let config: any
let icon: any
let iconResource: HTMLImageElement
let placeholder: HTMLElement

beforeEach(() => {
  placeholder = document.createElement('div')
  iconResource = document.createElement('img')
  config = {
    placeholder
  }
  icon = {
    height: 5,
    left: 0,
    top: 0,
    updated: true,
    width: 5,
    xPosition: 'left',
    yPosition: 'top'
  }
})

afterEach(() => {
  config = null
  icon = null
  ;(iconResource as any) = null
  ;(placeholder as any) = null
})

test('renderIcon must fail if there was a problem creating the icon', () => {
  const loadingError = new Error('problem loading icon')

  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.reject(loadingError)
  )
  expect(renderIcon(icon, config)).rejects.toBe(loadingError)
})

test('renderIcon must fail if the icon can not be rendered', () => {
  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => icon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => false)
  expect(renderIcon(icon, config)).rejects.toThrow("Icon can't be rendered")
})

test('must append the icon to the placeholder if three is no problem', async () => {
  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => icon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  await renderIcon(icon, config)

  expect(placeholder.contains(iconResource)).toBe(true)
})

test('renderIcon must reuse previously created icons', async () => {
  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => icon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  const renderedIcon = await renderIcon(icon, config)

  ;(loadResource as jest.Mock).mockClear()

  await renderIcon(renderedIcon, config)

  expect(loadResource).not.toHaveBeenCalled()

  expect(placeholder.contains(iconResource)).toBe(true)
})

test('renderIcon must return the updated icon', () => {
  const updatedIcon = Object.assign({}, icon)

  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  expect(renderIcon(icon, config)).resolves.toBe(updatedIcon)
})

test('renderIcon must style the icon element', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    updated: true,
    width: 6
  }

  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  await renderIcon(icon, config)

  const iconElement = icon.element

  expect(iconElement.style.position).toEqual('absolute')
  expect(iconElement.style.left).toEqual(`${updatedIcon.left}px`)
  expect(iconElement.style.top).toEqual(`${updatedIcon.top}px`)
  expect(iconElement.style.height).toEqual(`${updatedIcon.height}px`)
  expect(iconElement.style.width).toEqual(`${updatedIcon.width}px`)
})

test('renderIcon must wrap the resource with an anchor', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    width: 6
  }

  icon.foo = true
  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  await renderIcon(icon, config)

  const iconElement = icon.element

  expect(iconElement).toBeInstanceOf(HTMLAnchorElement)
  expect(iconElement.href).toBe('')
  expect(iconElement.target).toBe('')
  expect(iconResource.parentNode).toBe(iconElement)
  expect(iconResource.style.width).toBe('100%')
  expect(iconResource.style.height).toBe('100%')
})

test('renderIcon element anchor must have the clickThrough url if passed', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    width: 6
  }

  icon.iconClickThrough = 'http://test.example.com/iconClickThrough'
  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  await renderIcon(icon, config)

  const iconElement = icon.element

  expect(iconElement).toBeInstanceOf(HTMLAnchorElement)
  expect(iconElement.href).toBe(icon.iconClickThrough)
  expect(iconElement.target).toBe('_blank')
})

test('renderIcon element anchor on click must call the passed onIconClick method', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    width: 6
  }

  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  config.onIconClick = jest.fn()
  await renderIcon(icon, config)

  const iconElement = icon.element

  iconElement.click()

  expect(config.onIconClick).toHaveBeenCalledTimes(1)
  expect(config.onIconClick).toHaveBeenCalledWith(icon)
})

test('renderIcon must add the element if it has no parentNode', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    updated: false,
    width: 6
  }

  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  await renderIcon(icon, config)

  expect(icon.element.parentNode).toBe(placeholder)
})

test('renderIcon must must remove an icon that can no longer be rendered', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    updated: true,
    width: 6
  }

  ;(loadResource as jest.Mock).mockImplementation(() =>
    Promise.resolve(iconResource)
  )
  ;(updateIcon as jest.Mock).mockImplementation(() => updatedIcon)
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)

  await renderIcon(icon, config)

  expect(icon.element.parentNode).toBe(placeholder)
  ;(canBeRendered as jest.Mock).mockImplementation(() => false)

  try {
    await renderIcon(icon, config)
  } catch (error) {
    // Do nothing
  }

  expect(icon.element.parentNode).toBeNull()
})
