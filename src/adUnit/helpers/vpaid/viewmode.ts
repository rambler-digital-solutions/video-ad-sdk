const viewmode = (width: number, height: number): string => {
  const screen = window.screen;
  const isFullscreen = width + 100 > screen.width && height + 100 > screen.height;

  if (isFullscreen) {
    return 'fullscreen';
  }

  if (width < 400) {
    return 'thumbnail';
  }

  return 'normal';
};

export default viewmode;
