import {parseOffset} from '../parseOffset'

test('parseOffset must return the percentage', () => {
  expect(parseOffset('19.5%')).toBe('19.5%')
})

test('parseOffset must return the passed offset string in ms', () => {
  expect(parseOffset('00:00:05.000')).toBe(5000)
  expect(parseOffset('01:03:05.000')).toBe(3785000)
  expect(parseOffset('00:00:05.050')).toBe(5050)
})

test("parseOffset must return undefined if you don't pass a proper offset", () => {
  expect(parseOffset('')).toBeUndefined()
  expect(parseOffset('23423452353')).toBeUndefined()
  expect((parseOffset as any)()).toBeUndefined()
  expect((parseOffset as any)(undefined)).toBeUndefined()
})
