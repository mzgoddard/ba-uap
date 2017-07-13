const {join} = require('path');

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const dir = (...args) => join(__dirname, ...args);

module.exports = {
  context: dir(),
  entry: './src/index',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [dir('node_modules')],
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
    new HardSourceWebpackPlugin(),
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
