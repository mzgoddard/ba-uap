var path = require('path');

var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

var root = path.join(__dirname, '..');

module.exports = {
  // context: Content for entries.
  context: root,
  // devtool: Enable for source maps. Cheap means only line data. Module means
  // lines of the loader output, in this case the es5 output from babel.
  // devtool: 'cheap-module-source-map',
  // output: The directory and configuration for where webpack will write to.
  output: {
    path: path.join(root, 'node_modules/.cache/jest'),
    filename: '[name]',
    libraryTarget: 'commonjs2',
  },
  // externals: Treat dependencies that match any test in this option as
  // external to the chunk being built. Being external they need to be a script
  // as their own chunk or not need webpack to handle them.
  externals: function(context, request, cb) {
    // Inline modules with full path requests. As the jest script sets entry to
    // full path requests, this will let us build those modules. Any other
    // modules must be built as another entry or not require webpack work.
    if (/^\//.test(request)) {
      return cb(null);
    }
    // Any relative requests (e.g. ./app-card) are external and must be built as
    // their own entry/chunk.
    if (/^\./.test(request)) {
      return cb(null, path.resolve(context, request), 'commonjs2');
    }
    // All other modules are expected to not need webpack work and come from
    // node_modules (e.g. react).
    cb(null, request, 'commonjs2');
  },
  // module: module configuration.
  module: {
    // rules: Loaders automatically applied based on test, include, and
    // exclude options.
    rules: [
      // Apply babel-loader to any js file not under node_modules.
      {
        test: /\.jsx?$/,
        exclude: [path.resolve(root, 'node_modules')],
        loader: 'babel-loader',
        // options: Babel-loader configuration.
        options: {
          // babel.presets: Plugin presets babel loader will add on top of those
          // specified in babelrc.
          'presets': ['jest', ['env', {target: ['node >= 7'], modules: false}]],
        },
      },
      // // Apply baggage-loader to any js file not under node_modules. This
      // // configuration will auto-load an adjacent .styl file to the variable
      // // style. `app.jsx` will load `app.styl` for example.
      // {
      //   test: /\.jsx?$/,
      //   exclude: [path.resolve(root, 'node_modules')],
      //   loader: 'baggage-loader?[file].styl=style',
      // },
      // // Apply a sequence of loaders for css and stylus files.
      // {
      //   test: /\.(css|styl)$/,
      //   loader: 'css-loader/locals?modules&localIdentName=[path][name]---[local]---[hash:base64:5]!stylus-loader',
      // },
      // // Apply file-loader for assets, emitting their content with at a hashed
      // // filename and storing that filename in the output scripts.
      // {
      //   test: /\.(png|jpg|jpeg)$/,
      //   loader: 'file-loader',
      // },
    ],
  },
  // plugins: webpack plugins.
  plugins: [
    // A webpack cache plugin. A cache is written to the file system and reused
    // when possible during later runs for faster builds.
    new HardSourceWebpackPlugin({
      cacheDirectory: path.join(root, 'node_modules/.cache/hard-source/[confighash]'),
      recordsPath: path.join(root, 'node_modules/.cache/hard-source/[confighash]/records.json'),
      configHash: function(config) {
        // We can safely ignore entry in our hash. Changes to entry just mean
        // new chunks are built.
        config = Object.assign({}, config, {entry: null});
        return require('node-object-hash')().hash(config);
      },
      environmentPaths: {
        root: root,
      },
    }),
  ],
};
