import {handshakeVersion} from './api';

const major = (version: string): number => {
  const parts = version.split('.');

  return parseInt(parts[0], 10);
};

const isSupported = (supportedVersion: string, creativeVersion: string): boolean => {
  const creativeMajorNum = major(creativeVersion);

  if (creativeMajorNum < 1) {
    return false;
  }

  return creativeMajorNum <= major(supportedVersion);
};

const handshake = (creative, supportedVersion: string): string => {
  const creativeVersion = creative[handshakeVersion](supportedVersion);

  if (!isSupported(supportedVersion, creativeVersion)) {
    throw new Error(`Creative Version '${creativeVersion}' not supported`);
  }

  return creativeVersion;
};

export default handshake;
