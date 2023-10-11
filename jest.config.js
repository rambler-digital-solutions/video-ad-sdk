/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleDirectories: ['packages', 'node_modules'],
  collectCoverage: true,
  coverageReporters: ['text'],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 90,
      functions: 97,
      lines: 98
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
}
