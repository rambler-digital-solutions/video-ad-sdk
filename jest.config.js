module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**/*.js',
    '**/src/**/*.jsx',
    '**/src/**/*.tsx',
    '**/src/**/*.ts',
    '!**/src/**/*.d.ts',
    '!**/src/**/__tests__/**/*',
    '!**/src/**/__storybook__/**/*',
    '!**/src/**/__karma__/**/*'
  ],
  coverageDirectory: './coverage/',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  testURL: 'http://localhost',
  transformIgnorePatterns: ['node_modules']
}
