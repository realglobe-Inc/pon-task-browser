'use strict'

const path = require('path')
const aglob = require('aglob')
const assertEntryExists = require('./helpers/assertEntryExists')
const AutoDllPlugin = require('autodll-webpack-plugin')
const nameOfEntry = require('./helpers/nameOfEntry')
const normalizeEntryPath = require('./helpers/normalizeEntryPath')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

/**
 * Define task
 * @function define
 * @param {string} src - Source file name
 * @param {string} dest - Destination file name
 * @param {Object} [options={}] - Optional settings
 * @param {string} [options.cacheDir] Cache directory path
 * @param {Object} [options={}] - Optional settings
 * @param {boolean} [options.mode] - Webpack mode
 * @param {number} [options.watchDelay=100] - Delay after watch
 * @param {string[]} [options.watchIgnore] - Pattens to ignore for watch
 * @returns {function} Defined task
 */
function define (src, dest, options = {}) {
  const { NODE_ENV = 'development', CI } = process.env
  const production = NODE_ENV === 'production'
  const {
    externals = {},
    cache = !production,
    watchDelay = 400,
    context = process.cwd(),
    watchIgnore = [/node_modules/, /tmp/, /var/],
    watchPoll = 1000,
    skipWatching,
    vendor = false,
    devtool = production ? false : 'cheap-module-eval-source-map',
    mode = production ? 'production' : 'development',
    chunkFilename = 'chunks/[id].chunk.js?h=[chunkhash]',
    analyze = false,
    split = false,
    minimize = false,
    publicPath = '',
    splitName = 'external',
    env = {},
    ignores = [
      [/^\.\/locale$/, /moment$/],
    ],
    ...rest
  } = options

  {
    const restKeys = Object.keys(rest)
    if (restKeys.length > 0) {
      console.warn(`[pon-task-browser] Unknown options: ${restKeys}`)
    }
  }

  const compilerFor = (src, dest) => {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    const webpack = require('webpack')
    const { EnvironmentPlugin, IgnorePlugin } = webpack
    const entry = normalizeEntryPath(src, { context })
    return webpack(
      {
        externals,
        mode,
        entry,
        context,
        output: {
          publicPath,
          path: path.dirname(path.resolve(dest)),
          filename: path.basename(dest),
          chunkFilename,
        },
        module: {
          rules: [
            !production && {
              test: [
                /\.js$/,
                /\.mjs$/,
                /\.jsx$/,
              ],
              use: ['source-map-loader'],
              enforce: 'pre'
            }
          ].filter(Boolean),
        },
        optimization: {
          minimize,
          sideEffects: true,
          usedExports: true,
          removeEmptyChunks: production,
          splitChunks: split ? {
            name: splitName,
            chunks: 'all',
          } : false,
        },
        devtool,
        cache: cache ? {
          type: 'filesystem',
        } : false,
        node: {
          global: true,
        },
        resolve: {
          alias: {
            events: require.resolve('events'),
            querystring: require.resolve('querystring-es3'),
            path: require.resolve('path-browserify'),
            os: require.resolve('os-browserify'),
          }
        },
        plugins: [
          new HardSourceWebpackPlugin(),
          ...ignores.map(([resourceRegExp, contextRegExp]) =>
            new IgnorePlugin({ resourceRegExp, contextRegExp }),
          ),
          new EnvironmentPlugin({
            NODE_ENV,
            ...env,
          }),
          vendor ? new AutoDllPlugin({
            filename: '[name].dll.js',
            entry: {
              vendor: [...vendor]
            }
          }):  false,
          analyze ? new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: path.resolve(process.cwd(), `tmp/browser/${nameOfEntry(entry)}.html`),
            openAnalyzer: false,
          }) : false,
        ].filter(Boolean),
      }
    )
  }

  async function task (ctx) {
    const entry = normalizeEntryPath(src, { context })
    void assertEntryExists(entry)
    const { logger } = ctx
    const compiler = compilerFor(src, dest)
    await new Promise((resolve, reject) => {
      compiler.run((err, status) => {
        if (err) {
          reject(err)
          return
        }
        logger.debug(status.toString())
        resolve()
      })
    })
  }

  return Object.assign(task,
    {
      analyze: (ctx) => {
        return define(src, dest, {
          ...options,
          analyze: true
        })(ctx)
      }
    },
    ...[
      skipWatching ? null : {
        watch (ctx) {
          const { logger } = ctx
          const compiler = compilerFor(src, dest)
          const watch = compiler.watch({
            aggregateTimeout: watchDelay,
            ignored: watchIgnore,
            poll: watchPoll,
          }, (err, status) => {
            if (err) {
              logger.error(err)
              process.exit(1)
              return
            }
            logger.trace(status)
          })
          return watch.close.bind(watch)
        }
      }
    ],
  )
}

define.all = (srcDir, destDir, options = {}) => {
  const {
    pattern = '+(*.jsx|*.js|*.mjs)',
    skipWatching,
    context = process.cwd(),
    ...otherOptions
  } = options
  const defined = async () => {
    srcDir = path.resolve(context, srcDir)
    const filenames = await aglob(pattern, { cwd: srcDir })
    return filenames.map((filename) => {
      const src = path.join(srcDir, filename)
      const dest = path.join(destDir, filename)
      return define(src, dest, { ...otherOptions, context })
    })
  }

  async function task (ctx) {
    for (const d of await defined()) {
      await d(ctx)
    }
  }

  return Object.assign(
    task,
    {
      async analyze (ctx) {
        return Promise.all(
          (await defined()).map((d) =>
            d.analyze && d.analyze(ctx)
          )
        )
      }
    },
    skipWatching ? {} : {
      async watch (ctx) {
        return Promise.all(
          (await defined()).map((d) =>
            d.watch && d.watch(ctx)
          )
        )
      }
    }
  )
}

module.exports = define
