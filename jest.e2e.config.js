/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'E2E Tests',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tests/e2e/tsconfig.json',
      useESM: true
    }]
  },
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.e2e.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
  testTimeout: 30000, // 30 seconds for API calls
  collectCoverage: false, // E2E tests don't need coverage
  extensionsToTreatAsEsm: ['.ts'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '.',
      outputName: 'junit-e2e.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
}