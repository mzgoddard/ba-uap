const {join} = require('path');

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const dir = (...args) => join(__dirname, ...args);

module.exports = {
  context: dir(),
  entry: {
    level0: './src2/level0',
    level1: './src2/level1',
    'preact-crawl': './src2/level3/preact-crawl',
    preact: './src2/level3/preact',
    'preact-no0': './src2/level3/preact-no0',
    svg: './src2/level3/svg',
    'svg-no0': './src2/level3/svg-no0',
  },
  output: {
    path: dir('dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  externals: {
    preact: true,
  },
  resolve: {
    alias: {
      'preact$': dir('node_modules/preact/dist/preact.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [dir('node_modules'), dir('src')],
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {
              modules: false,
              loose: true
            }],
          ],
        },
      },
      {
        test: /\.js$/,
        include: [dir('src')],
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
    // new (require('webpack').optimize.UglifyJsPlugin)(),
    // new (require('webpack').EnvironmentPlugin)(),
    // new (require('webpack').IgnorePlugin)(/pattern-search/),
    new (require('webpack').DefinePlugin)({
      process: {env: {
        NODE_ENV: JSON.stringify('production'),
        BOXART_ENV: JSON.stringify('generated'),
      }},
    }),
    // new HardSourceWebpackPlugin(),
    {
      apply: function(compiler) {
        var start;
        compiler.plugin(['watch-run', 'run'], function(compiler, cb) {
          start = Date.now();
          cb();
        });
        compiler.plugin('compilation', function(compilation) {
          var start = Date.now();
          compilation.plugin('seal', function() {
            console.log(compilation.compiler.name, Date.now() - start);
          });
        });
        compiler.plugin('make', function(compilation, cb) {
          console.log('pre-make', Date.now() - start);
          start = Date.now();
          compilation.plugin('seal', function() {
            console.log('make', Date.now() - start);
            start = Date.now();
          });
          compilation.plugin('optimize-tree', function(chunks, modules, cb) {
            console.log('pre optimize-tree', Date.now() - start);
            start = Date.now();
            cb();
          });
          compilation.plugin('after-optimize-tree', function() {
            console.log('optimize-tree', Date.now() - start);
            start = Date.now();
          });
          compilation.plugin('after-optimize-assets', function() {
            console.log('post optimize-tree', Date.now() - start);
            start = Date.now();
          });
          cb();
        });
        compiler.plugin('emit', function(compilation, cb) {
          console.log('after-compile', Date.now() - start);
          start = Date.now();
          cb();
        })
        compiler.plugin('done', function() {
          console.log('emit', Date.now() - start);
        });
      },
    },
  ]
};
