const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

export default isIOS
