const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  bail: 1,
  clearMocks: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>',
  }),
  preset: 'ts-jest',
  // setupFiles: [],
  setupFilesAfterEnv: ['jest-chain', 'jest-extended'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[tj]s?(x)'],
};
