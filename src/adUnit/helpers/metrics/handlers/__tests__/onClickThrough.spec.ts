import {createVideoAdContainer} from '../../../../../adContainer';
import {linearEvents} from '../../../../../tracker';
import onClickThrough from '../onClickThrough';

const {clickThrough} = linearEvents;
let videoAdContainer;
let callback;

beforeEach(async () => {
  callback = jest.fn();
  videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  const {videoElement} = videoAdContainer;

  Object.defineProperty(videoElement, 'play', {
    value: jest.fn(),
    writable: true
  });

  Object.defineProperty(videoElement, 'pause', {
    value: jest.fn(),
    writable: true
  });

  Object.defineProperty(videoElement, 'paused', {
    value: true,
    writable: true
  });
});

afterEach(() => {
  callback = null;
  videoAdContainer = null;
});

test('onClickThrough must add an anchor to the videoAdContainer element', () => {
  const {element} = videoAdContainer;

  onClickThrough(videoAdContainer, callback);

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  expect(anchor).toBeInstanceOf(HTMLAnchorElement);
  expect(anchor.href).toBe('');
  expect(anchor.target).toBe('');
  expect(anchor.style.width).toEqual('100%');
  expect(anchor.style.height).toEqual('100%');
  expect(anchor.style.position).toEqual('absolute');
});

test('onClickThrough must add the clickThrough url to the anchor if passed', () => {
  const {element} = videoAdContainer;
  const clickThroughUrl = 'http://test.example.com/clickThroughUrl';

  onClickThrough(videoAdContainer, callback, {
    clickThroughUrl
  });

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  expect(anchor).toBeInstanceOf(HTMLAnchorElement);
  expect(anchor.href).toBe(clickThroughUrl);
  expect(anchor.target).toBe('_blank');
  expect(anchor.style.width).toEqual('100%');
  expect(anchor.style.height).toEqual('100%');
  expect(anchor.style.position).toEqual('absolute');
});

test('onClickThrough must on anchor click, pause the video content and call the callback with clickthrough', () => {
  const {element, videoElement} = videoAdContainer;

  onClickThrough(videoAdContainer, callback);

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  videoElement.paused = false;
  anchor.click();

  expect(videoElement.pause).toHaveBeenCalledTimes(1);
  expect(videoElement.play).not.toHaveBeenCalled();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(clickThrough);
});

test('onClickThrough must on anchor second click, play the video and not call the callback', () => {
  const {element, videoElement} = videoAdContainer;

  onClickThrough(videoAdContainer, callback);

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  videoElement.paused = true;
  anchor.click();

  expect(videoElement.play).toHaveBeenCalledTimes(1);
  expect(videoElement.pause).not.toHaveBeenCalled();
  expect(callback).not.toHaveBeenCalled();
});

test('onClickThrough must on anchor every click, not pause the video and call the callback with clickthrough', () => {
  const {element, videoElement} = videoAdContainer;

  onClickThrough(videoAdContainer, callback, {pauseOnAdClick: false});

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  videoElement.paused = false;
  anchor.click();

  expect(videoElement.pause).not.toHaveBeenCalled();
  expect(videoElement.play).not.toHaveBeenCalled();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(clickThrough);
});

test('onClickThrough must on anchor every click, not play the video and call the callback with clickthrough', () => {
  const {element, videoElement} = videoAdContainer;

  onClickThrough(videoAdContainer, callback, {pauseOnAdClick: false});

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  videoElement.paused = true;
  anchor.click();

  expect(videoElement.pause).not.toHaveBeenCalled();
  expect(videoElement.play).not.toHaveBeenCalled();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(clickThrough);
});

test('onClickThrough must remove the anchor on disconnect', () => {
  const {element} = videoAdContainer;

  const disconnect = onClickThrough(videoAdContainer, callback);

  disconnect();

  expect(element.querySelector('a.mol-vast-clickthrough')).toEqual(null);
});

test('onClickThrough must use custom click element', () => {
  const {element, videoElement} = videoAdContainer;
  const customClickElement = document.createElement('span');

  element.appendChild(customClickElement);

  const createClickControl = () => customClickElement;

  onClickThrough(videoAdContainer, callback, {createClickControl});

  videoElement.paused = false;
  customClickElement.click();

  expect(element.querySelector('a.mol-vast-clickthrough')).toBeNull();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(clickThrough);
});
