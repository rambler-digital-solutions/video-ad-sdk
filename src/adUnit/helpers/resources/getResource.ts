import {VastIcon} from '../../../types'

const getResource = ({
  staticResource,
  htmlResource,
  iFrameResource
}: VastIcon = {}): string | void =>
  staticResource || htmlResource || iFrameResource || undefined

export default getResource
