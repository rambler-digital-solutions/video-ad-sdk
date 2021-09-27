class FetchError extends Error {
  response?: Response;

  public constructor(message: string) {
    super(message)
    this.name = 'FetchError'
    Object.setPrototypeOf(this, FetchError.prototype)
  }
}

const isValidContentType = (contentType: string): boolean => {
  const normalisedCT = contentType.toLowerCase();

  return ['text/plain', 'text/html'].some((allowedType) => normalisedCT.includes(allowedType));
};

const fetchHtml = async (endpoint: string): Promise<string> => {
  const response = await fetch(endpoint);
  const contentType = response.headers.get('Content-Type');

  if (response.status >= 400) {
    const error = new FetchError(response.statusText);

    error.response = response;
    throw error;
  }

  if (!contentType || !isValidContentType(contentType)) {
    const error = new FetchError(`fetchHtml error, invalid Content-Type ${contentType}`);

    error.response = response;
    throw error;
  }

  return response.text();
};

export default fetchHtml;
