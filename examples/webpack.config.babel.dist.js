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
    'shapes': './shapes',
    'dot-plus': './svg/dot-plus',
    'spin-plus': './svg/spin-plus',
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
          dir('shapes'),
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
          dir('shapes'),
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
        test: /\.js$/,
        include: [
          dir('svg'),
        ],
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
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.DefinePlugin({
      'process.env.BOXART_ENV': '"generated"',
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   filename: 'vendor.js',
    // }),
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html.js',
      chunks: [],
    }),
    {
      apply: function(compiler) {
        compiler.plugin('compilation', function(compilation) {
          compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, cb) {
            if (
              htmlPluginData.outputName.endsWith('.svg') &&
              htmlPluginData.html.indexOf('<script>') === -1
            ) {
              htmlPluginData.html = htmlPluginData.html.replace('</svg>', '') +
                [
                  '<script type="text/javascript" charset="utf8"><![CDATA[',
                  htmlPluginData.plugin.options.chunks
                  .map(name => (
                    Object.entries(compilation.assets)
                    .find(([key]) => (
                      key.indexOf(name) !== -1 && key.endsWith('.js')
                    ))[1]
                    .source()
                  ))
                  .join('\n'),
                  ']]></script>',
                  '</svg>',
                ].join('\n');
            }
            cb(null, htmlPluginData);
          });
        });
      },
    },
  ]
  .concat([
    'dot-plus',
    'spin-plus',
  ].map(name => (
    new HtmlWebpackPlugin({
      filename: `svg/${name}.svg`,
      template: `./svg/${name}.svg.js`,
      chunks: [name],
      inject: false,
    })
  )))
  .concat([
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
    'shapes',
  ].map(name => new HtmlWebpackPlugin({
    filename: `${name}/index.html`,
    template: `./${name}/index.html.js`,
    chunks: [name],
  }))),
};
