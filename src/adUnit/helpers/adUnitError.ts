class AdUnitError extends Error {
  code?: number

  public constructor(message: string) {
    super(message)
    this.name = 'AdUnitError'
    Object.setPrototypeOf(this, AdUnitError.prototype)
  }
}

export default AdUnitError
