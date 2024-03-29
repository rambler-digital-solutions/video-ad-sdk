import type {VastIcon, VastChain, ParsedAd, Optional} from '../../../types'
import {getIcons} from '../../../vastSelectors'
import {getResource} from '../resources/getResource'

const UNKNOWN = 'UNKNOWN'

const uniqBy = (
  array: VastIcon[],
  uniqValue: typeof getResource
): VastIcon[] => {
  const seen: Record<string, boolean> = {}

  return array.filter((item) => {
    const key = uniqValue(item)

    if (!key || seen.hasOwnProperty(key)) {
      return false
    }

    seen[key] = true

    return true
  })
}

const uniqByResource = (icons: VastIcon[]): VastIcon[] =>
  uniqBy(icons, getResource)

const groupIconsByProgram = (icons: VastIcon[]): Record<string, VastIcon[]> =>
  icons.reduce((accumulator: Record<string, VastIcon[]>, icon) => {
    const program = icon.program ?? UNKNOWN

    accumulator[program] ??= []
    accumulator[program].push(icon)

    return accumulator
  }, {})

const sortIconByBestPxratio = (icons: VastIcon[]): VastIcon[] => {
  const devicePixelRatio = window.devicePixelRatio || 0

  const compareTo = (iconA: VastIcon, iconB: VastIcon): number => {
    const deltaA = Math.abs(devicePixelRatio - (iconA.pxratio || 0))
    const deltaB = Math.abs(devicePixelRatio - (iconB.pxratio || 0))

    return deltaA - deltaB
  }

  return icons.slice(0).sort(compareTo)
}

const chooseByPxRatio = (icons: VastIcon[]): VastIcon => {
  if (icons.length === 1) {
    return icons[0]
  }

  return sortIconByBestPxratio(icons)[0]
}

const chooseIcons = (icons: VastIcon[]): VastIcon[] => {
  const byProgram = groupIconsByProgram(icons)
  const programs = Object.keys(byProgram)

  return programs.reduce<VastIcon[]>((accumulator, program) => {
    if (program === UNKNOWN) {
      return [...accumulator, ...byProgram[UNKNOWN]]
    }

    return [...accumulator, chooseByPxRatio(byProgram[program])]
  }, [])
}

export const retrieveIcons = (vastChain: VastChain): Optional<VastIcon[]> => {
  const ads = vastChain.map(({ad}) => ad).filter(Boolean)
  const icons = ads.reduce<VastIcon[]>(
    (accumulator, ad: ParsedAd) => [...accumulator, ...(getIcons(ad) || [])],
    []
  )

  if (icons.length > 0) {
    const uniqIcons = uniqByResource(icons)

    return chooseIcons(uniqIcons)
  }
}
