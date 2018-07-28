/**
 * Define task
 * @function define
 * @param {string} src - Source file name
 * @param {string} dest - Destination file name
 * @param {Object} [options={}] - Optional settings
 * @param {string} [options.cacheFile='tmp/browser-cache.json'] Filename to store cache
 * @param {Object} [options={}] - Optional settings
 * @param {boolean} [options.debug=!isProduction()] - Source map enabled or not
 * @param {number} [options.watchDelay=100] - Delay after watch
 * @param {string[]} [options.watchTargets=[]] - Additional watch target filenames
 * @param {boolean} [options.fullPaths=true] - Use full paths
 * @param {Array} [options.plugins] - Browserify plugins
 * @returns {function} Defined task
 */
'use strict'

const path = require('path')
const aglob = require('aglob')
const amkdirp = require('amkdirp')
const {statAsync} = require('asfs')
const {isProduction} = require('asenv')
const {EOL} = require('os')

const normalizeEntryPath = (filename) => {
  const isAbsolute = /^\//.test(filename)
  if (isAbsolute) {
    return filename
  }
  const isRelative = /^\./.test(filename)
  if (isRelative) {
    return filename
  }
  return './' + filename
}

/** @lends define */
function define (src, dest, options = {}) {
  const {NODE_ENV = 'development'} = process.env
  const production = NODE_ENV === 'production'
  const {
    cacheDir = `tmp/cache/${path.basename(dest, path.extname(dest))}-cache-/:version/:mode`,
    watchDelay,
    version = 'latest',
    skipWatching,
    devtool = production ? false : 'cheap-eval-source-map',
    mode = production ? 'production' : 'development',
    ...rest
  } = options

  {
    const restKeys = Object.keys(rest)
    if (restKeys.length > 0) {
      console.warn(`[pon-task-browser] Unknown options: ${restKeys}`)
    }
  }

  const compilerFor = (src, dest) => {
    const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
    const webpack = require('webpack')
    const {EnvironmentPlugin} = webpack
    return webpack([
      {
        mode,
        entry: normalizeEntryPath(src),
        output: {
          path: path.dirname(path.resolve(dest)),
          filename: path.basename(dest),
        },
        devtool,
        plugins: [
          new EnvironmentPlugin({
            NODE_ENV,
          }),
          new HardSourceWebpackPlugin({
            cacheDir: cacheDir.replace(/:mode/, mode).replace(/:version/, version),
          }),
        ],
        node: {
          fs: 'empty'
        }
      }
    ])
  }

  async function task (ctx) {
    const stat = await statAsync(src).catch((err) => null)
    if (!stat) {
      throw new Error(`src not exists: ${src}`)
    }
    const {logger} = ctx
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
    ...[
      skipWatching ? null : {
        watch (ctx) {
          const {logger} = ctx
          const compiler = compilerFor(src, dest)
          const watch = compiler.watch({
            aggregateTimeout: watchDelay,
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
    ...otherOptions
  } = options
  const defined = async () => {
    const filenames = await aglob(pattern, {cwd: srcDir})
    return filenames.map((filename) => {
      const src = path.join(srcDir, filename)
      const dest = path.join(destDir, filename)
      return define(src, dest, otherOptions)
    })
  }

  async function task (ctx) {
    for (const d of await defined()) {
      await d(ctx)
    }
  }

  return Object.assign(
    task,
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
