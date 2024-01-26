export const getOrigin = (): string => {
  const {origin, protocol, hostname, port} = window.location

  /* istanbul ignore else */
  if (origin) {
    return origin
  }

  const resultPort = port ? `:${port}` : ''

  return `${protocol}//${hostname}${resultPort}`
}
