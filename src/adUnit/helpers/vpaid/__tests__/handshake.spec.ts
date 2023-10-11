import handshake from '../handshake'

describe('handshake', () => {
  test('must throw if the version is not supported', () => {
    const creative: any = {
      handshakeVersion: () => '0.1'
    }

    try {
      handshake(creative, '2.0')
    } catch (error: any) {
      expect(error.message).toBe("Creative Version '0.1' not supported")
    }
  })

  test('must return the creative version', () => {
    expect(handshake({handshakeVersion: () => '1.1'} as any, '2.0')).toBe('1.1')
    expect(handshake({handshakeVersion: () => '2.0'} as any, '2.0')).toBe('2.0')
  })
})
