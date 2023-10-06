export interface Listener {
  (...args: any[]): void
  _?: this
}

/**
 * Subset of node's [Emitter class]{@link https://nodejs.org/api/events.html#events_class_eventemitter}
 *
 * @param logger Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
 */
class Emitter {
  public logger: Console
  private events: Record<string, Listener[]>

  constructor(logger?: Console) {
    this.events = {}
    this.logger = logger || console
  }

  /**
   * Adds the listener function to the end of the listeners array for the event named eventName.
   *
   * @param eventName The name of the event.
   * @param listener Listener fn that handles the evt.
   * @returns The Emitter instance.
   */
  on(eventName: string, listener: Listener): this {
    const events = this.events
    const eventListeners = events[eventName] || (events[eventName] = [])

    eventListeners.push(listener)

    return this
  }

  /**
   * Removes the specified listener from the listener array for the event named eventName.
   *
   * @param eventName The name of the event.
   * @param listener Listener fn that handles the evt.
   * @returns The Emitter instance.
   */
  removeListener(eventName: string, listener: Listener): this {
    const events = this.events
    const eventListeners = events[eventName] || (events[eventName] = [])

    events[eventName] = eventListeners.filter(
      (eListener) => eListener !== listener && eListener._ !== listener
    )

    return this
  }

  /**
   * Removes all listeners, or those of the specified eventName.
   *
   * @param eventName The name of the event. Optional if omitted all listeners will be removed.
   * @returns The Emitter instance.
   */
  removeAllListeners(eventName: string): this {
    if (eventName) {
      delete this.events[eventName]
    } else {
      this.events = {}
    }

    return this
  }

  /**
   * Adds a one time listener function for the event named eventName. The next time eventName is triggered,
   * this listener is removed and then invoked.
   *
   * @param eventName The name of the event.
   * @param listener Listener fn that handles the evt.
   * @returns The Emitter instance.
   */
  once(eventName: string, listener: Listener): this {
    const handler: Listener = (...args) => {
      this.removeListener(eventName, handler)
      listener(...args)
    }

    handler._ = listener

    return this.on(eventName, handler)
  }

  /**
   * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered,
   * passing the supplied arguments to each.
   *
   * @param eventName The name of the event.
   * @returns Returns true if the event had listeners, false otherwise.
   */
  emit(eventName: string, ...args: any[]): boolean {
    const events = this.events
    const eventListeners = events[eventName] || (events[eventName] = [])
    const hasListeners = eventListeners.length > 0

    eventListeners.forEach((handler) => {
      try {
        handler(...args)
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(error, error.stack)
        }
      }
    })

    return hasListeners
  }
}

export default Emitter
