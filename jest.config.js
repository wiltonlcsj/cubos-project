module.exports = {
  bail: 1,
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '.(js|jsx|ts|tsx)': '@sucrase/jest-plugin',
  },
  setupFilesAfterEnv: ['jest-chain', 'jest-extended'],
};
