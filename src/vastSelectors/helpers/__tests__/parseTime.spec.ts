import {parseTime} from '../parseTime'

test('parseTime must return the passed offset string in ms', () => {
  expect(parseTime('00:00:05.000')).toBe(5000)
  expect(parseTime('01:03:05.000')).toBe(3785000)
  expect(parseTime('00:00:05.050')).toBe(5050)
})

test("parseTime must return undefined if you don't pass a proper offset", () => {
  expect(parseTime('')).toBeUndefined()
  expect(parseTime('23423452353')).toBeUndefined()
  expect((parseTime as any)()).toBeUndefined()
  expect((parseTime as any)(undefined)).toBeUndefined()
})
