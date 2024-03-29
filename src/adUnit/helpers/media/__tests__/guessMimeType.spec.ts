import {guessMimeType} from '../guessMimeType'

test('guessMimeType must guess the mime of the passed source', () => {
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
    unknown: 'video/unknown',
    webm: 'video/webm',
    wmv: 'video/x-ms-wmv'
  }

  Object.keys(mimeMap).forEach((extension) => {
    expect(guessMimeType(`/some/source.${extension}`)).toBe(mimeMap[extension])
  })
})
