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

const co = require('co')
const path = require('path')
const amkdirp = require('amkdirp')
const { statAsync } = require('asfs')
const { byPattern } = require('pon-task-compile')
const { isProduction } = require('asenv')

const normalizeStringArray = (values) => [].concat(values)
  .reduce((array, v) => array.concat(v.split(',')), [])

/** @lends define */
function define (src, dest, options = {}) {
  let {
    cacheFile = 'tmp/browser-cache-:env.json',
    debug = !isProduction(),
    watchDelay = 100,
    watchTargets = [],
    plugins = [],
    externals = [],
    requires = [],
    transforms = [],
    skipWatching = false,
    fullPaths = true
  } = options

  const srcDir = src && path.dirname(src)
  const destDir = dest && path.dirname(dest)

  const fileNameForEnv = (filename) => filename.replace(':env', process.env.NODE_ENV || 'default')

  const compiler = (readStream, inputSourceMap = null, options = {}) => co(function * () {

    let stat = yield statAsync(src).catch((err) => null)
    if (!stat) {
      throw new Error(`src not exists: ${src}`)
    }

    const browserify = require('browserify')
    const browserifyIncremental = require('browserify-incremental')

    yield amkdirp(path.dirname(fileNameForEnv(cacheFile)))
    yield amkdirp(destDir)
    let b = browserify(readStream, {
      cache: {},
      debug,
      basedir: options.src && path.dirname(options.src),
      packageCache: {},
      fullPaths
    })
    browserifyIncremental(b, { cacheFile: fileNameForEnv(cacheFile) })

    for (let [ plugin, pluginsOption ] of plugins) {
      b.plugin(plugin, pluginsOption)
    }

    for (let transform of transforms) {
      b.transform(transform)
    }

    for (let external of normalizeStringArray(externals)) {
      b.external(external)
    }

    for (let require of normalizeStringArray(requires)) {
      b.require(require)
    }

    return [ b.bundle(), null ]
  })

  let task = byPattern(srcDir, destDir, compiler, {
    pattern: src ? path.basename(src) : null,
    watchDelay,
    watchTargets,
    namer: () => path.basename(dest),
    stream: true
  })

  let { watch } = task

  return Object.assign(function browser (ctx) {
    return task(ctx)
  }, skipWatching ? {} : { watch })
}

module.exports = define
