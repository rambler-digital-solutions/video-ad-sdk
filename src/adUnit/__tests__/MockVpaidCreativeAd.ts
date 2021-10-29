import Emitter from '../helpers/Emitter';
import {
  handshakeVersion,
  initAd,
  startAd,
  stopAd,
  resumeAd,
  pauseAd,
  skipAd,
  setAdVolume,
  getAdVolume,
  resizeAd,
  adVolumeChange,
  getAdIcons,
  getAdDuration,
  getAdRemainingTime
} from '../helpers/vpaid/api';

class MockVpaidCreativeAd extends Emitter {
  version: string;
  volume = 0.8;

  constructor(version = '2.0') {
    super();
    this.version = version;
  }

  [handshakeVersion] = jest.fn(() => this.version);
  [initAd] = jest.fn();
  [startAd] = jest.fn();
  [stopAd] = jest.fn();
  [resumeAd] = jest.fn();
  [pauseAd] = jest.fn();
  [skipAd] = jest.fn();
  [getAdIcons] = jest.fn();
  [getAdDuration] = jest.fn();
  [getAdRemainingTime] = jest.fn();
  [setAdVolume] = jest.fn((volume) => {
    this.volume = volume;
    this.emit(adVolumeChange);
  });
  [getAdVolume] = jest.fn(() => this.volume);
  [resizeAd] = jest.fn();

  subscribe(listener: (...args: any[]) => void, event: string): void {
    this.on(event, listener);
  }

  unsubscribe(listener: (...args: any[]) => void, event: string): void {
    this.removeListener(event, listener);
  }
}

export default MockVpaidCreativeAd;
