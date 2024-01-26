import {getResource} from '../getResource'

test('getResource must get the source of the passed resource payload', () => {
  const source = 'http://test.example.com/resource'

  expect(getResource()).toBeUndefined()
  expect(
    getResource({
      staticResource: source
    })
  ).toBe(source)
  expect(
    getResource({
      htmlResource: source
    })
  ).toBe(source)
  expect(
    getResource({
      iFrameResource: source
    })
  ).toBe(source)
})
