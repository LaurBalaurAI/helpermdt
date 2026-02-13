const webpack = require('webpack');

module.exports = function override(config, env) {
  // Ignore Electron-specific modules in React build
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "crypto": false,
    "stream": false,
    "buffer": false,
  };
  
  // Define process.env for React
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    })
  );
  
  return config;
};
