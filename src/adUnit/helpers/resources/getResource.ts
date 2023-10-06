import {VastIcon} from '../../../types'

const getResource = ({
  staticResource,
  htmlResource,
  iFrameResource
}: VastIcon = {}): string =>
  staticResource || htmlResource || iFrameResource || ''

export default getResource
