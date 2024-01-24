import {pixelTracker} from '../pixelTracker'

test('pixelTracker must return the image Image with the parsed macro as source', () => {
  const urlMacros = [
    'https://test.example.com/0/[CODE]',
    'https://test.example.com/1/[CODE]',
    'https://test.example.com/2/[CODE]'
  ]

  const trackImgs = urlMacros.map((urlMacro) =>
    pixelTracker(urlMacro, {CODE: 'TEST_CODE'})
  )

  trackImgs.forEach((image, index) => {
    expect(image).toBeInstanceOf(Image)
    expect(image.src).toBe(`https://test.example.com/${index}/TEST_CODE`)
  })
})
