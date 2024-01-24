class FetchError extends Error {
  response?: Response

  public constructor(message: string) {
    super(message)
    this.name = 'FetchError'
    Object.setPrototypeOf(this, FetchError.prototype)
  }
}

const BAD_REQUEST = 400

export const fetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const fetchOptions = {
    credentials: 'include' as RequestCredentials,
    ...options
  }

  const response = await window.fetch(endpoint, fetchOptions)

  if (response.status >= BAD_REQUEST) {
    const error = new FetchError(response.statusText)

    error.response = response
    throw error
  }

  return response
}
