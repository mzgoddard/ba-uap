const {join} = require('path');

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const dir = (...args) => join(__dirname, ...args);

module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
  },

  context: dir(),
  entry: {
    'vendor': [
      './public-path',
    ],
    'moving-box': './moving-box',
    'many-boxes': './many-boxes',
    'flip': './flip',
    'spiral': './spiral',
    'react-transition': './react-transition',
  },
  output: {
    path: dir('../dist'),
    filename: '[name]/index.js',
    // publicPath: '/ba-uap/',
  },
  resolve: {
    alias: {
      'uap': dir('../src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [dir('../node_modules')],
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {targets: {browsers: ['chrome >= 56']}, modules: false}],
            'react',
          ],
        },
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html.js',
      chunks: [],
    }),
    new HardSourceWebpackPlugin({
      cacheDirectory: dir('../node_modules/.cache/hard-source/[confighash]'),
      recordsPath: dir('../node_modules/.cache/hard-source/[confighash]/records.json'),
      configHash: require('node-object-hash')().hash,
    }),
  ].concat([
    'moving-box',
    'many-boxes',
    'flip',
    'spiral',
    'react-transition',
  ].map(name => new HtmlWebpackPlugin({
    filename: `${name}/index.html`,
    template: `./${name}/index.html.js`,
    chunks: [name, 'vendor'],
  }))),
};
