import sortMediaByBestFit from '../sortMediaByBestFit'

let mediafiles

beforeEach(() => {
  mediafiles = [
    {
      height: 360,
      width: 640
    },
    {
      height: 1080,
      width: 1920
    },
    {
      height: 480,
      width: 854
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 640,
      width: 360
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 854,
      width: 480
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 480,
      width: 270
    }
  ]
})

test('sortMediaByBestFit must sort the mediaFiles by best fit into the horizontally oriented screen', () => {
  const sortedMediaFiles = sortMediaByBestFit(mediafiles, {
    height: 480,
    width: 854
  })

  expect(sortedMediaFiles).not.toBe(mediafiles)
  expect(sortedMediaFiles).toEqual([
    {
      height: 480,
      width: 854
    },
    {
      height: 360,
      width: 640
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 1080,
      width: 1920
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 854,
      width: 480
    },
    {
      height: 640,
      width: 360
    },
    {
      height: 480,
      width: 270
    }
  ])
})

test('sortMediaByBestFit must sort the mediaFiles by best fit into the vertically oriented screen', () => {
  const sortedMediaFiles = sortMediaByBestFit(mediafiles, {
    height: 854,
    width: 480
  })

  expect(sortedMediaFiles).not.toBe(mediafiles)
  expect(sortedMediaFiles).toEqual([
    {
      height: 854,
      width: 480
    },
    {
      height: 640,
      width: 360
    },
    {
      height: 480,
      width: 270
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 360,
      width: 640
    },
    {
      height: 480,
      width: 854
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 1080,
      width: 1920
    }
  ])
})

test('sortMediaByBestFit must sort the mediaFiles by best fit, with vertical non identical values', () => {
  mediafiles = [
    {
      height: 360,
      width: 640
    },
    {
      height: 1080,
      width: 1920
    },
    {
      height: 480,
      width: 854
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 640,
      width: 360
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 480,
      width: 270
    }
  ]

  const sortedMediaFiles = sortMediaByBestFit(mediafiles, {
    height: 854,
    width: 480
  })

  expect(sortedMediaFiles).not.toBe(mediafiles)
  expect(sortedMediaFiles).toEqual([
    {
      height: 640,
      width: 360
    },
    {
      height: 480,
      width: 270
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 360,
      width: 640
    },
    {
      height: 480,
      width: 854
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 1080,
      width: 1920
    }
  ])
})

test('sortMediaByBestFit must sort the mediaFiles by best fit, with horizontally non identical values', () => {
  mediafiles = [
    {
      height: 360,
      width: 640
    },
    {
      height: 1080,
      width: 1920
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 640,
      width: 360
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 480,
      width: 270
    }
  ]

  const sortedMediaFiles = sortMediaByBestFit(mediafiles, {
    height: 480,
    width: 854
  })

  expect(sortedMediaFiles).not.toBe(mediafiles)
  expect(sortedMediaFiles).toEqual([
    {
      height: 360,
      width: 640
    },
    {
      height: 270,
      width: 480
    },
    {
      height: 720,
      width: 1280
    },
    {
      height: 1080,
      width: 1920
    },
    {
      height: 1280,
      width: 720
    },
    {
      height: 1920,
      width: 1080
    },
    {
      height: 640,
      width: 360
    },
    {
      height: 480,
      width: 270
    }
  ])
})

test('sortMediaByBestFit must sort the mediaFiles by best fit, with square video', () => {
  mediafiles = [
    {
      height: 300,
      width: 300
    },
    {
      height: 200,
      width: 200
    },
    {
      height: 100,
      width: 100
    }
  ]

  const sortedMediaFiles = sortMediaByBestFit(mediafiles, {
    height: 220,
    width: 220
  })

  expect(sortedMediaFiles).not.toBe(mediafiles)
  expect(sortedMediaFiles).toEqual([
    {
      height: 200,
      width: 200
    },
    {
      height: 300,
      width: 300
    },

    {
      height: 100,
      width: 100
    }
  ])
})
