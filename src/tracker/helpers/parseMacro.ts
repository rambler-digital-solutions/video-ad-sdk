import {VastMacro, MacroData} from '../../types'

const toUpperKeys = (map: MacroData): MacroData => {
  const upperKeysMap: MacroData = {}

  Object.keys(map).forEach((key) => {
    upperKeysMap[key.toUpperCase()] = map[key]
  })

  return upperKeysMap
}

/**
 * Parses the passed macro with the passed data and returns the resulting parsed Macro.
 * If no CACHEBUSTING property is passed in the data it will generate a random one on its own.
 * If no TIMESTAMP property is passed in the data it will generate a one on its own.
 *
 * @param macro The string macro to be parsed.
 * @param data The data used by the macro.
 * @returns The parsed macro.
 */
const parseMacro = (macro: VastMacro, data: MacroData = {}): string => {
  let parsedMacro = macro
  const macroData = toUpperKeys(data)

  if (!macroData.CACHEBUSTING) {
    macroData.CACHEBUSTING = Math.round(Math.random() * 1.0e10)
  }

  if (!macroData.TIMESTAMP) {
    macroData.TIMESTAMP = new Date().toISOString()
  }

  Object.keys(macroData).forEach((key) => {
    const value = encodeURIComponent(macroData[key])

    parsedMacro = parsedMacro.replace(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp('\\[' + key + '\\]', 'gm'),
      value
    )
  })

  return parsedMacro
}

export default parseMacro
