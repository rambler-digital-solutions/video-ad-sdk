const safeCallback =
  (callback: (...args: any) => void, logger?: Console) =>
  (...args: any[]): void => {
    try {
      callback(...args)
    } catch (error) {
      logger?.error(error)
    }
  }

export default safeCallback
