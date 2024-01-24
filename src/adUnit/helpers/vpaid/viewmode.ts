const FULLSCREEN_LAPSE = 100
const THUMBNAIL_MAX_WIDTH = 400

export const viewmode = (width: number, height: number): string => {
  const {screen} = window
  const isFullscreen =
    width + FULLSCREEN_LAPSE > screen.width &&
    height + FULLSCREEN_LAPSE > screen.height

  if (isFullscreen) {
    return 'fullscreen'
  }

  if (width < THUMBNAIL_MAX_WIDTH) {
    return 'thumbnail'
  }

  return 'normal'
}
