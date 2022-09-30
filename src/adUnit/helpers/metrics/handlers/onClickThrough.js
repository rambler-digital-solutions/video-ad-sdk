/* eslint-disable callback-return, promise/prefer-await-to-callbacks */
import {linearEvents} from '../../../../tracker';

const {clickThrough} = linearEvents;

const createDefaultClickControl = () => {
  const anchor = document.createElement('A');

  anchor.classList.add('mol-vast-clickthrough');
  anchor.style.width = '100%';
  anchor.style.height = '100%';
  anchor.style.position = 'absolute';
  anchor.style.left = 0;
  anchor.style.top = 0;

  return anchor;
};

const onClickThrough = ({videoElement, element}, callback, {clickThroughUrl, pauseOnAdClick = true, createClickControl = createDefaultClickControl} = {}) => {
  const placeholder = element || videoElement.parentNode;
  const anchor = createClickControl();
  const isVirtual = !document.body.contains(anchor);

  if (isVirtual) {
    placeholder.appendChild(anchor);
  }

  if (clickThroughUrl && anchor.tagName === 'A') {
    anchor.href = clickThroughUrl;
    anchor.target = '_blank';
  }

  anchor.onclick = (event) => {
    if (Event.prototype.stopPropagation !== undefined) {
      event.stopPropagation();
    }

    if (videoElement.paused && pauseOnAdClick) {
      if (Event.prototype.preventDefault !== undefined) {
        event.preventDefault();
      }

      videoElement.play();
    } else {
      if (pauseOnAdClick) {
        videoElement.pause();
      }

      callback(clickThrough);
    }
  };

  return () => {
    if (isVirtual) {
      placeholder.removeChild(anchor);
    }
  };
};

export default onClickThrough;
