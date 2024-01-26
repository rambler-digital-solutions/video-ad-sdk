export const isIos = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
