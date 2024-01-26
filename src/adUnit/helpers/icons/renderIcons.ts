import type {VastIcon, RenderedVastIcon} from '../../../types'
import type {VideoAdContainer} from '../../../adContainer'
import {renderIcon} from './renderIcon'
import {canBeShown} from './canBeShown'

interface RenderIconsOptions {
  videoAdContainer: VideoAdContainer
  logger?: Console
  onIconClick?(icon: VastIcon): void
}

export const renderIcons = async (
  icons: VastIcon[],
  {onIconClick, videoAdContainer, logger = console}: RenderIconsOptions
): Promise<VastIcon[]> => {
  const {element, videoElement} = videoAdContainer
  const drawnIcons: RenderedVastIcon[] = []

  const {iconsToShow, otherIcons} = icons.reduce<{
    iconsToShow: VastIcon[]
    otherIcons: VastIcon[]
  }>(
    (accumulator, icon) => {
      if (canBeShown(icon, videoElement)) {
        accumulator.iconsToShow.push(icon)
      } else {
        accumulator.otherIcons.push(icon)
      }

      return accumulator
    },
    {
      iconsToShow: [],
      otherIcons: []
    }
  )

  otherIcons.forEach(({element: iconElement}) => {
    iconElement?.parentNode?.removeChild(iconElement)
  })

  await iconsToShow.reduce<Promise<void>>(async (promise, icon: VastIcon) => {
    try {
      await promise

      const renderedIcon = await renderIcon(icon, {
        document,
        drawnIcons,
        onIconClick,
        placeholder: element
      })

      drawnIcons.push(renderedIcon)
    } catch (error: any) {
      logger.log(error)
    }
  }, Promise.resolve())

  return drawnIcons
}
