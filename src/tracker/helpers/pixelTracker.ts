import type {PixelTracker} from '../../types'
import {parseMacro} from './parseMacro'

/**
 * Creates a tracking image with the passed URL macro.
 *
 * @param urlMacro URL Macro that need to be tracked.
 * @param data Data Object with the macros's variables.
 * @returns Image element whose source is the parsed URL Macro.
 */
export const pixelTracker: PixelTracker = (urlMacro, data) => {
  const img = new Image()

  img.src = parseMacro(urlMacro, data)

  return img
}
