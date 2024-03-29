export enum ErrorCode {
  VAST_XML_PARSING_ERROR = 100,
  VAST_SCHEMA_VALIDATION_ERROR = 101,
  VAST_UNSUPPORTED_VERSION = 102,
  VAST_UNEXPECTED_AD_TYPE = 200,
  VAST_UNEXPECTED_LINEARITY = 201,
  VAST_UNEXPECTED_DURATION_ERROR = 202,
  VAST_UNEXPECTED_MEDIA_FILE = 203,
  VAST_WRAPPER_ERROR = 300,
  VAST_LOAD_TIMEOUT = 301,
  VAST_TOO_MANY_REDIRECTS = 302,
  VAST_NO_ADS_AFTER_WRAPPER = 303,
  VIDEO_PLAY_ERROR = 400,
  VAST_MEDIA_FILE_NOT_FOUND = 401,
  VAST_MEDIA_LOAD_TIMEOUT = 402,
  VAST_LINEAR_ASSET_MISMATCH = 403,
  VAST_PROBLEM_DISPLAYING_MEDIA_FILE = 405,
  VAST_NONLINEAR_PLAYING_FAILED = 500,
  VAST_NONLINEAR_DIMENSIONS_ERROR = 501,
  VAST_NONLINEAR_LOADING_FAILED = 502,
  VAST_NONLINEAR_ASSET_MISMATCH = 503,
  UNKNOWN_ERROR = 900,
  VPAID_ERROR = 901
}

export const isVastErrorCode = (code: number): boolean =>
  Object.values(ErrorCode).includes(code)
