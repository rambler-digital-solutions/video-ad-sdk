import type {VpaidCreativeAdUnit} from '../../../types'
import {handshakeVersion} from './api'

const major = (version: string): number => {
  const parts = version.split('.')

  return parseInt(parts[0], 10)
}

const isSupported = (
  supportedVersion: string,
  creativeVersion: string
): boolean => {
  const creativeMajorNumber = major(creativeVersion)

  if (creativeMajorNumber < 1) {
    return false
  }

  return creativeMajorNumber <= major(supportedVersion)
}

export const handshake = (
  creativeAd: VpaidCreativeAdUnit,
  supportedVersion: string
): string => {
  const creativeVersion = creativeAd[handshakeVersion](supportedVersion)

  if (!isSupported(supportedVersion, creativeVersion)) {
    throw new Error(`Creative Version '${creativeVersion}' not supported`)
  }

  return creativeVersion
}
