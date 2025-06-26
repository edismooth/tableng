module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  collectCoverageFrom: [
    'projects/tableng/src/lib/**/*.ts',
    '!projects/tableng/src/lib/**/*.spec.ts',
    '!projects/tableng/src/lib/**/*.module.ts',
    '!projects/tableng/src/public-api.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/projects/tableng/src/lib/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: 'projects/tableng/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  },
  moduleNameMapper: {
    '^tableng$': '<rootDir>/projects/tableng/src/public-api.ts',
    '^tableng/(.*)$': '<rootDir>/projects/tableng/src/lib/$1'
  }
}; 