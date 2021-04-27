// test: /\.worker\.js$/,
// const path = require('fs');

module.exports = function override(config) {
  config.module.rules.push({
    test: /\.worker\.(c|m)?js$/i,
    loader: 'worker-loader',
    options: {
      filename: '[name].worker.js',
    },
  });
  return config;
};
