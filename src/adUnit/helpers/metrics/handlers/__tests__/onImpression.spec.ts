import {linearEvents} from '../../../../../tracker';
import onImpression from '../onImpression';

const {impression, creativeView} = linearEvents;
let videoElement;

beforeEach(() => {
  videoElement = document.createElement('VIDEO');
  Object.defineProperty(videoElement, 'duration', {
    value: 100,
    writable: true
  });
  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  });
});

afterEach(() => {
  videoElement = null;
});

test('onImpression must call the callback with impression and creativeView when there is a impression of the current video', () => {
  const callback = jest.fn();
  const disconnect = onImpression({videoElement}, callback);

  videoElement.currentTime = 1;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith(impression);
  expect(callback).toHaveBeenCalledWith(creativeView);
  callback.mockClear();

  videoElement.currentTime = 1.5;
  videoElement.dispatchEvent(new Event('timeupdate'));

  videoElement.currentTime = 2;
  videoElement.dispatchEvent(new Event('timeupdate'));

  videoElement.currentTime = 2.5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  disconnect();

  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 10;

  expect(callback).toHaveBeenCalledTimes(0);
});
