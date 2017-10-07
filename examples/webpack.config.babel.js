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
    'preact-transition': './preact-transition',
    'preact-auto-transition': './preact-auto-transition',
    'preact-auto-transition-live': './preact-auto-transition-live',
    'preact-ref-test': './preact-ref-test',
    '2048-1': './2048-1',
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
        exclude: [
          dir('../node_modules'),
          dir('preact-transition'),
          dir('preact-ref-test'),
          dir('preact-auto-transition'),
          dir('preact-auto-transition-live'),
          dir('2048-1'),
        ],
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {
              modules: false,
              loose: true
            }],
            'react',
          ],
        },
      },
      {
        test: /\.js$/,
        include: [
          dir('preact-transition'),
          dir('preact-ref-test'),
          dir('preact-auto-transition'),
          dir('preact-auto-transition-live'),
          dir('2048-1'),
        ],
        exclude: [dir('../node_modules')],
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {
              modules: false,
              loose: true
            }],
            'preact',
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
    new (require('../src2/webpack/function-compile-plugin'))(),
    new webpack.DefinePlugin({
      process: {env: {
        // BOXART_ENV: '"generated"',
      }},
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
    }),
    new HtmlWebpackPlugin({
      template: './index.html.js',
      chunks: [],
    }),
    // new HardSourceWebpackPlugin({
    //   cacheDirectory: dir('../node_modules/.cache/hard-source/[confighash]'),
    //   recordsPath: dir('../node_modules/.cache/hard-source/[confighash]/records.json'),
    //   configHash: require('node-object-hash')().hash,
    // }),
  ].concat([
    'moving-box',
    'many-boxes',
    'flip',
    'spiral',
    'react-transition',
    'preact-transition',
    'preact-auto-transition',
    'preact-auto-transition-live',
    'preact-ref-test',
    '2048-1',
  ].map(name => new HtmlWebpackPlugin({
    filename: `${name}/index.html`,
    template: `./${name}/index.html.js`,
    chunks: [name, 'vendor'],
  }))),
};
