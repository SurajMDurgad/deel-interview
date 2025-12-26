const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add PDF to the list of asset extensions
config.resolver.assetExts.push('pdf');

module.exports = config;

