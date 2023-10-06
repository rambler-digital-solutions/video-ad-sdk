const createAdContainer = (): HTMLDivElement => {
  const adContainer = document.createElement('div')

  adContainer.classList.add('mol-video-ad-container')
  adContainer.style.width = '100%'
  adContainer.style.height = '100%'

  return adContainer
}

export default createAdContainer
