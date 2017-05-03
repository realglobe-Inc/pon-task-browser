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
 * @param {Array} [options.plugins] - Browserify plugins
 * @returns {function} Defined task
 */
'use strict'

const co = require('co')
const path = require('path')
const amkdirp = require('amkdirp')
const { statAsync } = require('asfs')
const { Readable } = require('stream')
const { byPattern } = require('pon-task-compile')
const { isProduction } = require('asenv')
const fs = require('fs')

/** @lends define */
function define (src, dest, options = {}) {
  let {
    cacheFile = 'tmp/browser-cache.json',
    debug = !isProduction(),
    watchDelay = 100,
    watchTargets = [],
    plugins = []
  } = options

  const srcDir = src && path.dirname(src)
  const destDir = dest && path.dirname(dest)

  const compiler = (code, inputSourceMap = null, options = {}) => co(function * () {
    let stat = yield statAsync(src).catch((err) => null)
    if (!stat) {
      throw new Error(`src not exists: ${src}`)
    }

    const browserify = require('browserify')
    const browserifyIncremental = require('browserify-incremental')

    yield amkdirp(path.dirname(cacheFile))
    yield amkdirp(destDir)
    let readable = new Readable()
    readable.push(code)
    readable.push(null)
    let b = browserify(readable, {
      cache: {},
      debug,
      basedir: path.dirname(options.src),
      packageCache: {},
      fullPaths: false
    })
    browserifyIncremental(b, { cacheFile })

    for (let [ plugin, pluginsOption ] of plugins) {
      b.plugin(plugin, pluginsOption)
    }
    let write = fs.createWriteStream(dest)
    yield new Promise((resolve, reject) => {
      b.bundle().pipe(write)
      write.on('close', () => resolve())
      write.on('error', (err) => reject(err))
    })
    let { ctx } = options
    if (ctx) {
      let { logger, cwd } = ctx
      logger.debug('File generated:', path.relative(cwd, dest))
    }
  })

  let task = byPattern(srcDir, destDir, compiler, {
    pattern: path.basename(src),
    watchDelay,
    watchTargets,
    namer: () => path.basename(dest)
  })

  let { watch } = task

  return Object.assign(function browser (ctx) {
    return task(ctx)
  }, { watch })
}

module.exports = define
