const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
//   resolver: {
//     alias: {
//       '@assets': path.resolve(__dirname, 'src/assets'),
//       '@components': path.resolve(__dirname, 'src/components'),
//       '@config': path.resolve(__dirname, 'src/config'),
//       '@constants': path.resolve(__dirname, 'src/constants'),
//       '@context': path.resolve(__dirname, 'src/context'),
//       '@hooks': path.resolve(__dirname, 'src/hooks'),
//       '@locales': path.resolve(__dirname, 'src/locales'),
//       '@navigation': path.resolve(__dirname, 'src/navigation'),
//       '@redux': path.resolve(__dirname, 'src/redux'),
//       '@screens': path.resolve(__dirname, 'src/screens'),
//       '@scripts': path.resolve(__dirname, 'src/scripts'),
//       '@transactions': path.resolve(__dirname, 'src/transactions'),
//       '@utils': path.resolve(__dirname, 'src/utils'),
//       '@appTypes': path.resolve(__dirname, 'src/types'),
//     },
//   },
};

module.exports = mergeConfig(defaultConfig, customConfig);

// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);
