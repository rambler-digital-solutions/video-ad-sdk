import {createVideoAdContainer} from '../../../../adContainer/createVideoAdContainer'
import {VideoAdContainer} from '../../../../adContainer/VideoAdContainer'
import {addIcons} from '../addIcons'
import {createResource} from '../../resources/createResource'
import {canBeRendered} from '../canBeRendered'

jest.mock('../../resources/createResource')
jest.mock('../canBeRendered')

const waitFor = (element: HTMLElement, eventName: string): Promise<Event> =>
  new Promise<Event>((resolve) => element.addEventListener(eventName, resolve))

let videoAdContainer: VideoAdContainer
let logger: any

beforeEach(() => {
  videoAdContainer = createVideoAdContainer(document.createElement('div'))
  logger = {error: jest.fn()}

  const {videoElement} = videoAdContainer

  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  })

  Object.defineProperty(videoElement, 'duration', {
    value: 10,
    writable: true
  })
  ;(createResource as jest.Mock).mockImplementation(() => {
    const resourceElement = document.createElement('img')

    resourceElement.classList.add('mock-icon-element')

    resourceElement.width = 100
    resourceElement.height = 100

    setTimeout(() => resourceElement.dispatchEvent(new Event('load')))

    return resourceElement
  })
  ;(canBeRendered as jest.Mock).mockImplementation(() => true)
})

afterEach(() => {
  ;(videoAdContainer as any) = null
  logger = null
})

test('addIcons must add the icons to the video ad container', async () => {
  const icons: any[] = [
    {
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ]
  const {element} = videoAdContainer

  const {drawIcons} = addIcons(icons, {
    logger,
    videoAdContainer
  })

  drawIcons()
  await waitFor(element, 'iconsDrawn')

  icons.forEach((icon) => expect(element.contains(icon.element)).toBe(true))
})

test('addIcons must not add the the icons whose offset is not meet yet', async () => {
  const icons: any[] = [
    {
      height: 20,
      offset: 5000,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ]
  const {element, videoElement} = videoAdContainer

  const {drawIcons} = addIcons(icons, {
    logger,
    videoAdContainer
  })

  drawIcons()

  await waitFor(element, 'iconsDrawn')

  expect(element.contains(icons[0].element)).toBe(false)
  expect(element.contains(icons[1].element)).toBe(true)

  videoElement.currentTime = 5

  drawIcons()

  await waitFor(element, 'iconsDrawn')

  expect(element.contains(icons[0].element)).toBe(true)
  expect(element.contains(icons[1].element)).toBe(true)
})

test('addIcons must remove the icons once the duration is met', async () => {
  const icons: any[] = [
    {
      duration: 5000,
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ]
  const {element, videoElement} = videoAdContainer

  const {drawIcons} = addIcons(icons, {
    logger,
    videoAdContainer
  })

  drawIcons()

  await waitFor(element, 'iconsDrawn')

  expect(element.contains(icons[0].element)).toBe(true)
  expect(element.contains(icons[1].element)).toBe(true)

  videoElement.currentTime = 5.1

  drawIcons()

  await waitFor(element, 'iconsDrawn')

  expect(element.contains(icons[0].element)).toBe(false)
  expect(element.contains(icons[1].element)).toBe(true)
})

test('addIcons must return a remove function', async () => {
  const icons: any[] = [
    {
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ]
  const {element} = videoAdContainer

  const {drawIcons, removeIcons} = addIcons(icons, {
    logger,
    videoAdContainer
  })

  await drawIcons()

  expect(element.contains(icons[0].element)).toBe(true)
  expect(element.contains(icons[1].element)).toBe(true)

  await removeIcons()

  expect(element.contains(icons[0].element)).toBe(false)
  expect(element.contains(icons[1].element)).toBe(false)
})

test('addIcons must call onIconView hook the moment the icon gets added to the page', async () => {
  const icons: any[] = [
    {
      height: 20,
      offset: 5000,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ]
  const {element, videoElement} = videoAdContainer
  const onIconView = jest.fn()

  const {drawIcons} = addIcons(icons, {
    logger,
    onIconView,
    videoAdContainer
  })

  drawIcons()
  await waitFor(element, 'iconsDrawn')

  expect(onIconView).toHaveBeenCalledTimes(1)
  expect(onIconView).toHaveBeenCalledWith(icons[1])

  videoElement.currentTime = 5

  drawIcons()

  await waitFor(element, 'iconsDrawn')

  expect(onIconView).toHaveBeenCalledTimes(2)
  expect(onIconView).toHaveBeenCalledWith(icons[0])
  expect(onIconView).toHaveBeenCalledWith(icons[1])
})
