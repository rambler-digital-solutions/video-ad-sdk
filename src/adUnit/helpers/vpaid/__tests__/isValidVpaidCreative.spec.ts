import {METHODS} from '../api'
import {isValidVpaidCreative} from '../isValidVpaidCreative'

const createVpaidCreative = (): any =>
  METHODS.reduce((accumulator, key) => {
    accumulator[key] = () => {}

    return accumulator
  }, {} as any)

test("isValidVpaidCreative must return false if doesn't implement the vpaid interface", () => {
  for (const method of METHODS) {
    const creative = createVpaidCreative()

    delete creative[method]

    expect(isValidVpaidCreative(creative)).toBe(false)
  }

  expect(isValidVpaidCreative(createVpaidCreative())).toBe(true)
})
