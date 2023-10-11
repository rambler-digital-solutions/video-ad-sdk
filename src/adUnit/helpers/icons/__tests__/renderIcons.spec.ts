import createVideoAdContainer from '../../../../adContainer/createVideoAdContainer'
import VideoAdContainer from '../../../../adContainer/VideoAdContainer'
import renderIcons from '../renderIcons'
import renderIcon from '../renderIcon'
import canBeShown from '../canBeShown'

jest.mock('../renderIcon')
jest.mock('../canBeShown')

let videoAdContainer: VideoAdContainer
let logger: any
let icons: any

beforeEach(async () => {
  videoAdContainer = createVideoAdContainer(document.createElement('div'))
  logger = {
    log: jest.fn()
  }
  icons = [
    {
      height: 3,
      width: 5
    },
    {
      height: 3,
      width: 5
    }
  ]
  ;(canBeShown as jest.Mock).mockImplementation(() => true)
})

afterEach(() => {
  ;(videoAdContainer as any) = null
  logger = null
  icons = null
})

test('renderIcons must filter out the icons that can not be shown due to their offset or duration', () => {
  const iconElement = document.createElement('DIV')

  icons[0].element = iconElement
  videoAdContainer.element.appendChild(iconElement)
  ;(canBeShown as jest.Mock).mockImplementation(() => false)

  expect(
    renderIcons(icons, {
      logger,
      videoAdContainer
    })
  ).resolves.toEqual([])

  expect(iconElement.parentNode).toBeNull()
})

test('renderIcons must render the passed icons and return an array with the rendered icon definitions updated', () => {
  const updatedIcon = {
    height: 3,
    left: 6,
    top: 0,
    width: 5
  }

  ;(renderIcon as jest.Mock).mockImplementation(() =>
    Promise.resolve(updatedIcon)
  )

  expect(
    renderIcons(icons, {
      logger,
      videoAdContainer
    })
  ).resolves.toEqual([updatedIcon, updatedIcon])
})

test('renderIcons must log an error if an icon failed to render and return the other icons', async () => {
  const updatedIcon = {
    height: 3,
    left: 6,
    top: 0,
    width: 5
  }

  const renderError = new Error('Error rendering the icon')

  ;(renderIcon as jest.Mock)
    .mockImplementationOnce(() => Promise.reject(renderError))
    .mockImplementationOnce(() => Promise.resolve(updatedIcon))

  const renderedIcons = await renderIcons(icons, {
    logger,
    videoAdContainer
  })

  expect(renderedIcons).toEqual([updatedIcon])

  expect(logger.log).toHaveBeenCalledTimes(1)
  expect(logger.log).toHaveBeenCalledWith(renderError)
})
