import type {ExecutionContext} from '../types'
import {loadScript, type LoadScriptOptions} from './helpers/loadScript'
import {createAdVideoElement} from './helpers/createAdVideoElement'
import {createAdContainer} from './helpers/createAdContainer'
import {createIframe} from './helpers/createIframe'
import {createSlot} from './helpers/createSlot'
import {getContentDocument} from './helpers/getContentDocument'
import {unique} from './helpers/unique'

const nextId = unique('videoAdContainer')
const hidden = Symbol('hidden')

interface Hidden {
  destroyed: boolean
  id: string
  iframe?: HTMLIFrameElement
  readyPromise?: Promise<any>
}

/**
 * Options map to add script to {@link VideoAdContainer}
 */
export type AddScriptOptions = Omit<LoadScriptOptions, 'placeholder'>

/**
 * This class provides everything necessary to contain and create a video ad within a given placeholder Element.
 */
export class VideoAdContainer {
  public element: HTMLElement
  public slotElement?: HTMLElement
  public videoElement: HTMLVideoElement
  public executionContext?: ExecutionContext
  public isOriginalVideoElement: boolean

  private [hidden]: Hidden = {
    destroyed: false,
    id: nextId(),
    iframe: undefined,
    readyPromise: undefined
  }

  /**
   * Creates a VideoAdContainer.
   *
   * @param placeholder DIV that will contain the ad.
   * @param videoElement optional videoElement that will be used to play the ad.
   */
  public constructor(
    placeholder: HTMLElement,
    videoElement?: HTMLVideoElement
  ) {
    if (!(placeholder instanceof Element)) {
      throw new TypeError('placeholder is not an Element')
    }

    this.element = createAdContainer()
    this.isOriginalVideoElement = Boolean(videoElement)

    if (videoElement) {
      this.videoElement = videoElement
    } else {
      this.videoElement = createAdVideoElement()
      this.element.appendChild(this.videoElement)
    }

    placeholder.appendChild(this.element)
  }

  /**
   * Adds the passed script to the ad container.
   *
   * @param src script source uri.
   * @param options Options map.
   */
  public async addScript(
    source: string,
    options: AddScriptOptions = {}
  ): Promise<HTMLScriptElement> {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed')
    }

    let {iframe} = this[hidden]

    if (!iframe) {
      iframe = await createIframe(this.element, this[hidden].id)
      this[hidden].iframe = iframe
      this.executionContext = iframe.contentWindow as ExecutionContext
    }

    const placeholder = getContentDocument(iframe)?.body

    return loadScript(source, {
      placeholder,
      ...options
    })
  }

  /**
   * Adds the slot to the ad container.
   *
   * @param width - Slot width.
   * @param height - Slot height.
   */
  public addSlot(width: number, height: number): void {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed')
    }

    if (!this.slotElement) {
      this.slotElement = createSlot(this.element, width, height)
    }
  }

  /**
   * Destroys the VideoAdContainer.
   */
  public destroy(): Promise<void> {
    // NOTE: calling destroy immediately terminates the iframe and cancels
    //       tracking requests from vpaid script, so destroying should
    //       immediately hides and remove the iframe from dom after timeout
    const removePromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        this.element.parentNode?.removeChild(this.element)
        resolve()
      }, 1000)
    })

    this.element.style.zIndex = '-9999'
    this[hidden].destroyed = true

    return removePromise
  }

  /**
   * Checks if the container is destroyed.
   *
   * @returns true if the container is destroyed and false otherwise.
   */
  public isDestroyed(): boolean {
    return this[hidden].destroyed
  }
}
