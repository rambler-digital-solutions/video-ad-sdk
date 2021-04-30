class FetchError extends Error {
  response?: Response;
}

const fetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaults = {
    credentials: 'include'
  };
  const fetchOptions = Object.assign({}, defaults, options);
  const response = await window.fetch(endpoint, fetchOptions);

  if (response.status >= 400) {
    const error = new FetchError(response.statusText);

    error.response = response;
    throw error;
  }

  return response;
};

export default fetch;
