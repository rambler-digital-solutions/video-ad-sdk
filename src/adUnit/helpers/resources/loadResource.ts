import type {VastIcon} from '../../../types'
import {waitFor} from '../dom/waitFor'
import {createResource, type ResourceElement} from './createResource'

export interface LoadResourceOptions {
  document: Document
  placeholder: HTMLElement
}

const noop = (): void => {}

export const loadResource = (
  icon: VastIcon,
  {document, placeholder}: LoadResourceOptions
): Promise<ResourceElement> =>
  new Promise<ResourceElement>((resolve, reject) => {
    try {
      const resourceElement = createResource(document, icon)
      const resourceErrorWait = waitFor(resourceElement, 'error')
      const resourceLoadWait = waitFor(resourceElement, 'load')
      const cleanUp = (): void => {
        if (placeholder.contains(resourceElement)) {
          placeholder.removeChild(resourceElement)
          resourceElement.style.zIndex = '0'
        }
      }

      /* eslint-disable promise/prefer-await-to-then */
      resourceErrorWait.promise
        .then(() => {
          resourceLoadWait.cancel()
          cleanUp()

          reject(new Error('Error loading resource'))
        })
        .catch(noop)

      resourceLoadWait.promise
        .then(() => {
          resourceErrorWait.cancel()
          cleanUp()

          resolve(resourceElement)
        })
        .catch(noop)
      /* eslint-enable promise/prefer-await-to-then */

      // Some browsers will not load the resource if they are not added to the DOM
      resourceElement.style.zIndex = '-9999'
      placeholder.appendChild(resourceElement)
    } catch (error) {
      reject(error)
    }
  })
