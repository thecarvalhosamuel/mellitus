const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './src/global.css',
  configPath: './tailwind.config.ts',
  // 1rem = 16px: a escala padrão do Tailwind (h-12 = 48) bate com os tokens do design.
  inlineRem: 16,
});
