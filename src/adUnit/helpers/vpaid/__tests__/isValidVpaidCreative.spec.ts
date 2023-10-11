import {METHODS} from '../api'
import isValidVpaidCreative from '../isValidVpaidCreative'

const createVpaidCreative = (): any =>
  METHODS.reduce((acc, key) => {
    acc[key] = () => {}

    return acc
  }, {} as any)

test("isValidVpaidCreative must return false if doesn't implement the vpaid interface", () => {
  for (const method of METHODS) {
    const creative = createVpaidCreative()

    delete creative[method]

    expect(isValidVpaidCreative(creative)).toBe(false)
  }

  expect(isValidVpaidCreative(createVpaidCreative())).toBe(true)
})