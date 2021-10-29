class VastError extends Error {
  code?: number

  public constructor(message: string) {
    super(message)
    this.name = 'VastError'
    Object.setPrototypeOf(this, VastError.prototype)
  }
}

export default VastError;
