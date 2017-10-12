const {basename} = require('path');

const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const webpack = require('webpack');

const run = require('./run-module');

class FunctionCompilePlugin {
  apply(compiler) {
    compiler.options.module.rules.splice(0, 0, {
      test: /\.animations\.js/,
      loader: require.resolve('./function-compile-loader'),
    });

    let i = 0;
    compiler.plugin('this-compilation', function(compilation, {normalModuleFactory}) {
      // console.log('compilation');
      compilation.plugin('normal-module-loader', function(loaderContext) {
        // console.log('normal-module-loader', i++);
        loaderContext._inBoxartFunction = false;
        loaderContext.compileBoxartFunction = function(resource, cb) {
          let childCompilation;
          let compilationPlugins;
          const compilerName = basename(resource);
          const child = compilation.createChildCompiler(compilerName, {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
          }, [
            {
              apply(childCompiler) {
                childCompiler.plugin('this-compilation', function(compilation) {
                  childCompilation = compilation;
                  childCompilation.plugin('normal-module-loader', function(loaderContext) {
                    loaderContext._inBoxartFunction = true;
                  });
                });

                childCompiler.plugin('make', (compilation, cb) => {
                  if (compilation.cache) {
                    if (!compilation.cache[compilerName]) {
                      compilation.cache[compilerName] = {};
                    }
                    compilation.cache = compilation.cache[compilerName];
                  }
                  cb();
                });
              }
            },
            new SingleEntryPlugin(
              compiler.options.context,
              resource,
              '__function_compile_plugin__'
            ),
            new webpack.DefinePlugin({
              process: {
                env: {
                  BOXART_ENV: JSON.stringify('compile'),
                },
              },
            }),
            {
              apply: function(compiler) {
                compilationPlugins = compiler._plugins.compilation || [];
              },
            },
          ]);
          child._plugins.compilation = compilationPlugins.concat(child._plugins.compilation);
          // child.apply(new webpack.DefinePlugin({
          //   process: {
          //     env: {
          //       BOXART_ENV: JSON.stringify('compile'),
          //     },
          //   },
          // }));

          child.runAsChild(function(err) {
            if (err) {
              return cb(err);
            }

            try {
              const asset = childCompilation.assets['__function_compile_plugin__.js'];
              const source = asset.source();
              // console.log(source);
              const output = eval(source);

              childCompilation.fileDependencies.forEach(loaderContext.addDependency);
              // console.log(childCompilation.fileDependencies);

              Object.keys(compilation.assets).forEach(key => {
                delete compilation.assets[key];
              });

              cb(null, output && output.default || output);
            }
            catch (e) {
              return cb(e);
            }
          });
        }
      });
    });
  }
}

module.exports = FunctionCompilePlugin;
