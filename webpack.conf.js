var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-cheap-module-source-map',
  bail: false,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: [
          path.resolve(__dirname, 'assets/js'),
          path.resolve(__dirname, 'node_modules/@bigcommerce/stencil-utils')
        ],
        query: {
          compact: false,
          cacheDirectory: true,
          presets: [['es2015', {loose: true}]]
        }
      }
    ]
  },
  plugins: [],
  watch: false
};
