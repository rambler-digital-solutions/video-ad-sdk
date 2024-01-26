/* eslint-disable no-console */
import {runWaterfall, type VideoAdUnit} from '../src'
import './styles.css'

document.addEventListener('DOMContentLoaded', () => {
  const textArea = document.querySelector('#adTag') as HTMLTextAreaElement
  const testButton = document.querySelector(
    '.vast-test-btn'
  ) as HTMLButtonElement
  const videoElement = document.querySelector(
    '.vast-media video'
  ) as HTMLVideoElement
  const videoAdContainer = document.querySelector(
    '.video-ad-container'
  ) as HTMLDivElement
  let adUnit: VideoAdUnit

  const onAdReady = (newAdUnit: VideoAdUnit): void => {
    adUnit = newAdUnit
    console.log('### onAdReady', adUnit)

    const eventHandler = (event: any): void => {
      console.log(`### ${event.type}`, event.adUnit)
    }

    ;[
      'pause',
      'resume',
      'finish',
      'impression',
      'start',
      'skip',
      'firstQuartile',
      'midpoint',
      'thirdQuartile',
      'complete'
    ].forEach((eventType) => {
      adUnit.on(eventType, eventHandler)
    })
  }

  const requestAdRun = (): void => {
    const adTag = textArea.value
    const source = videoElement.src

    const resumeContent = (): void => {
      videoElement.play()
      videoElement.removeEventListener('contentloadedmetadata', resumeContent)
      videoElement.removeEventListener('canplay', resumeContent)
    }

    const onError = (error: Error): void => {
      console.log('### onError', error)
    }

    const onRunFinish = (): void => {
      console.log('### onRunFinish')
      videoAdContainer.classList.remove('active')

      if (videoElement.src === source) {
        videoElement.play()
      } else {
        videoElement.addEventListener('contentloadedmetadata', resumeContent)
        videoElement.addEventListener('canplay', resumeContent)
        videoElement.src = source
        videoElement.load()
      }
    }

    videoAdContainer.classList.add('active')
    videoElement.pause()
    videoElement.currentTime = 0

    console.log('### adTag', adTag)

    runWaterfall(adTag, videoAdContainer, {
      onAdReady,
      onError,
      onRunFinish,
      timeout: 15000,
      videoElement,
      credentials: 'omit'
    })
  }

  textArea.addEventListener('change', () => {
    const adTag = textArea.value

    if (adTag) {
      testButton.classList.add('active')
      testButton.addEventListener('click', requestAdRun)
    } else {
      testButton.classList.remove('active')
      testButton.removeEventListener('click', requestAdRun)
    }
  })
})
