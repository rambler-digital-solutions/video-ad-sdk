const mimeMap: Record<string, string> = {
  '3gp': 'video/3gpp',
  avi: 'video/x-msvideo',
  flv: 'video/x-flv',
  m3u8: 'application/x-mpegURL',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  mpd: 'application/dash+xml',
  ogv: 'video/ogg',
  ts: 'video/MP2T',
  webm: 'video/webm',
  wmv: 'video/x-ms-wmv'
}

export const guessMimeType = (source: string): string => {
  const match = source.match(/\.([^./?]+)(\?[^/]+)?$/i)
  const extension = match && match[1]

  return (extension && mimeMap[extension]) || `video/${extension}`
}
