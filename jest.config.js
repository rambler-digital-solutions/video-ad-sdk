/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleDirectories: ['packages', 'node_modules'],
  collectCoverage: true,
  coverageReporters: ['text'],
  coverageThreshold: {
    global: {
      statements: 87,
      branches: 76,
      functions: 90,
      lines: 93
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
}
