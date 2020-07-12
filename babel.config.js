module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@controllers': './src/app/controllers',
          '@helpers': './src/app/helpers',
          '@models': './src/app/models',
          '@services': './src/app/services',
          '@interfaces': './src/app/interfaces',
          '@validators': './src/app/validators',
          '@repositories': './src/app/repositories',
        },
      },
    ],
  ],
  ignore: ['**/*.spec.ts'],
};
