module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  watchman: false,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          module: 'commonjs',
          isolatedModules: true,
          declaration: false,
          declarationMap: false,
          sourceMap: false,
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      },
    ],
  },
};
