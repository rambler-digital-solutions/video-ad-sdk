import type {VastMacro, MacroData} from '../../types'

const toUpperKeys = (map: MacroData): MacroData => {
  const upperKeysMap: MacroData = {}

  Object.keys(map).forEach((key) => {
    const {[key]: value} = map

    upperKeysMap[key.toUpperCase()] = value
  })

  return upperKeysMap
}

const CACHEBUSTING_MAX = 1.0e10

/**
 * Parses the passed macro with the passed data and returns the resulting parsed Macro.
 * If no CACHEBUSTING property is passed in the data it will generate a random one on its own.
 * If no TIMESTAMP property is passed in the data it will generate a one on its own.
 *
 * @param macro The string macro to be parsed.
 * @param data The data used by the macro.
 * @returns The parsed macro.
 */
export const parseMacro = (macro: VastMacro, data: MacroData = {}): string => {
  let parsedMacro = macro
  const macroData = toUpperKeys(data)

  if (!macroData.CACHEBUSTING) {
    macroData.CACHEBUSTING = Math.round(Math.random() * CACHEBUSTING_MAX)
  }

  if (!macroData.TIMESTAMP) {
    macroData.TIMESTAMP = new Date().toISOString()
  }

  Object.keys(macroData).forEach((key) => {
    const value = encodeURIComponent(macroData[key])

    parsedMacro = parsedMacro.replace(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(`\\[${key}\\]`, 'gm'),
      value
    )
  })

  return parsedMacro
}
