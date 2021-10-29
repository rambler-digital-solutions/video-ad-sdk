import debounce from 'lodash.debounce';
import MutationObserver from './helpers/MutationObserver';

type Callback = () => void;

const validate = (target: HTMLElement, callback: Callback): void => {
  if (!(target instanceof Element)) {
    throw new TypeError('Target is not an Element node');
  }

  if (!(callback instanceof Function)) {
    throw new TypeError('Callback is not a function');
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

const sizeMutationAttrs = ['style', 'clientWidth', 'clientHeight'];

const createResizeMO = (
  target: HTMLElement,
  callback: Callback
): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    for (let index = 0; index < mutations.length; index++) {
      const {attributeName} = mutations[index];

      if (attributeName && sizeMutationAttrs.includes(attributeName)) {
        // eslint-disable-next-line callback-return
        callback();
      }
    }
  });

  observer.observe(target, {
    attributes: true,
    characterData: false,
    childList: true
  });

  return observer;
};

const mutationHandlers = Symbol('mutationHandlers');
const observerKey = Symbol('mutationObserver');

interface ObservedHTMLElement extends HTMLElement {
  [mutationHandlers]?: Callback[];
  [observerKey]?: MutationObserver;
}

const onMutation = (
  target: ObservedHTMLElement,
  callback: Callback
): Callback => {
  if (!target[mutationHandlers]) {
    target[mutationHandlers] = [];

    const execHandlers = (): void => {
      target[mutationHandlers]?.forEach((handler) => handler());
    };

    target[observerKey] = createResizeMO(target, execHandlers);
  }

  target[mutationHandlers]?.push(callback);

  return () => {
    target[mutationHandlers] = target[mutationHandlers]?.filter(
      (handler) => handler !== callback
    );

    if (target[mutationHandlers]?.length === 0) {
      target[observerKey]?.disconnect();

      delete target[mutationHandlers];
      delete target[observerKey];
    }
  };
};

const createResizeElement = (callback: Callback): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');

  // eslint-disable-next-line max-len
  iframe.setAttribute(
    'style',
    'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; border: 0; overflow: hidden; pointer-events: none; z-index: -1;'
  );
  iframe.setAttribute('type', 'text/html');
  iframe.setAttribute('loading', 'eager');
  iframe.onload = () => {
    if (iframe.contentWindow) {
      iframe.contentWindow.addEventListener('resize', callback);
    }
  };
  iframe.src = 'about:blank';

  return iframe;
};
const resizeHandlers: unique symbol = Symbol('resizeHandlers');
const resizeElement: unique symbol = Symbol('resizeElement');

interface ResizableHTMLElement extends HTMLElement {
  [resizeHandlers]?: Callback[];
  [resizeElement]?: HTMLIFrameElement;
}

// Original code http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
const onResize = (
  target: ResizableHTMLElement,
  callback: Callback
): Callback => {
  if (!target[resizeHandlers]) {
    target[resizeHandlers] = [];

    const execHandlers = (): void => {
      target[resizeHandlers]?.forEach((handler) => handler());
    };

    target[resizeElement] = createResizeElement(execHandlers);

    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }

    target.appendChild(target[resizeElement] as HTMLIFrameElement);
  }

  target[resizeHandlers]?.push(callback);

  return () => {
    target[resizeHandlers] = target[resizeHandlers]?.filter(
      (handler) => handler !== callback
    );

    if (target[resizeHandlers]?.length === 0) {
      target.removeChild(target[resizeElement] as HTMLIFrameElement);

      delete target[resizeHandlers];
      delete target[resizeElement];
    }
  };
};

/**
 * onElementResize callback will be called whenever the target element resized.
 * Note: called with no params
 *
 * @ignore
 */
type ResizeCallback = () => void;

interface ResizeObserverOptions {
  /**
   * Sets a debounce threshold for the callback. Defaults to 20 milliseconds
   */
  threshold?: number;
}

/**
 * Helper function to know if an element has been resized.
 *
 * @ignore
 *
 * @param target The element that we want to observe.
 * @param callback The callback that handles the resize.
 * @param options Options Map.
 *
 * @returns Unsubscribe function.
 */
const onElementResize = (
  target: HTMLElement,
  callback: ResizeCallback,
  {threshold = 20}: ResizeObserverOptions = {}
): Callback => {
  validate(target, callback);

  const makeSizeId = ({
    style,
    clientHeight,
    clientWidth
  }: HTMLElement): string =>
    [style.width, style.height, clientWidth, clientHeight].join('.');
  let lastSize = makeSizeId(target);
  const checkElementSize = (): void => {
    const currentSize = makeSizeId(target);

    if (currentSize !== lastSize) {
      lastSize = currentSize;
      // eslint-disable-next-line callback-return
      callback();
    }
  };

  const checkElementHandler = debounce(checkElementSize, threshold);
  const stopObservingMutations = Boolean(MutationObserver)
    ? onMutation(target, checkElementHandler)
    : noop;
  const stopListeningToResize = onResize(target, checkElementHandler);

  return () => {
    stopObservingMutations();
    stopListeningToResize();
  };
};

export default onElementResize;
