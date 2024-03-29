import {
  canBeRendered,
  hasSpace,
  withinBoundaries,
  withoutOverlaps
} from '../canBeRendered'

const mockClientRect = (
  element: HTMLElement,
  mockValue: Partial<DOMRect>
): void => {
  element.getBoundingClientRect = jest.fn(() => mockValue as DOMRect)
}

let newIcon: any
let placeholder: any
let drawnIcons: any
let config: any

beforeEach(() => {
  placeholder = document.createElement('div')

  newIcon = {
    element: document.createElement('img')
  }

  drawnIcons = [
    {
      element: document.createElement('img')
    },
    {
      element: document.createElement('img')
    }
  ]

  config = {
    drawnIcons,
    placeholder
  }
})

afterEach(() => {
  placeholder = null
  newIcon = null
  drawnIcons = null
  config = null
})

test('hasSpace must return false the icons used area is above the allowed space and true otherwise', () => {
  mockClientRect(placeholder, {
    height: 10,
    width: 10
  })

  Object.assign(newIcon, {
    height: 1,
    width: 3
  })

  Object.assign(drawnIcons[0], {
    height: 3,
    width: 5
  })

  Object.assign(drawnIcons[1], {
    height: 3,
    width: 5
  })

  expect(hasSpace(newIcon, config)).toBe(true)

  Object.assign(newIcon, {
    height: 2,
    width: 3
  })

  expect(hasSpace(newIcon, config)).toBe(false)
})

test('withinBoundaries must return true if the icon position is withing the placeholder and false otherwise', () => {
  mockClientRect(placeholder, {
    height: 10,
    left: 0,
    top: 0,
    width: 10
  })

  expect(
    withinBoundaries(
      {
        height: 1,
        left: 0,
        top: -10,
        width: 3
      } as any,
      config
    )
  ).toBe(false)

  expect(
    withinBoundaries(
      {
        height: 1,
        left: 0,
        top: 10,
        width: -3
      } as any,
      config
    )
  ).toBe(false)

  expect(
    withinBoundaries(
      {
        height: 1,
        left: 0,
        top: 0,
        width: 3
      } as any,
      config
    )
  ).toBe(true)
})

test('withoutOverlaps must return false if the icon overlaps with any drawn icons', () => {
  mockClientRect(placeholder, {
    height: 10,
    width: 10
  })

  Object.assign(drawnIcons[0], {
    height: 3,
    left: 0,
    top: 0,
    width: 5
  })

  Object.assign(drawnIcons[1], {
    height: 3,
    left: 6,
    top: 0,
    width: 5
  })

  Object.assign(newIcon, {
    height: 1,
    left: 0,
    top: 0,
    width: 3
  })

  expect(withoutOverlaps(newIcon, config)).toBe(false)

  Object.assign(newIcon, {
    height: 1,
    left: 7,
    top: 4,
    width: 3
  })

  expect(withoutOverlaps(newIcon, config)).toBe(true)
})

test('canBeRendered must return true if the icon has space, is within the boundaries and does not overlap with any drawn icon', () => {
  mockClientRect(placeholder, {
    height: 10,
    width: 10
  })

  Object.assign(drawnIcons[0], {
    height: 3,
    left: 0,
    top: 0,
    width: 5
  })

  Object.assign(drawnIcons[1], {
    height: 3,
    left: 6,
    top: 0,
    width: 5
  })

  Object.assign(newIcon, {
    height: 1,
    left: 7,
    top: 4,
    width: 3
  })

  expect(canBeRendered(newIcon, config)).toBe(true)
})
