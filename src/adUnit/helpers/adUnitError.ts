/**
 * Ad unit error
 */
export class AdUnitError extends Error {
  code?: number

  public constructor(message: string) {
    super(message)
    this.name = 'AdUnitError'
    Object.setPrototypeOf(this, AdUnitError.prototype)
  }
}
