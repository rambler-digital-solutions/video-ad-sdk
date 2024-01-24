import type {VastIcon} from '../../../types'

export const getResource = ({
  staticResource,
  htmlResource,
  iFrameResource: indexFrameResource
}: VastIcon = {}): string | void =>
  staticResource || htmlResource || indexFrameResource || undefined
