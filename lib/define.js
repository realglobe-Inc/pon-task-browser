/**
 * Define task
 * @function define
 * @param {string} srcDir - Source directory name
 * @param {string} destDir - Destination directory name
 * @param {Object} [options={}] - Optional settings
 * @param {string|string[]} [options.pattern='*.js'] - File name pattern
 * @param {string} [options.cacheFile='tmp/browser-cache.json'] Filename to store cache
 * @param {Object} [options={}] - Optional settings
 * @param {boolean} [options.debug=!isProduction()] - Source map enabled or not
 * @param {number} [options.watchDelay=100] - Delay after watch
 * @param {Array} [options.plugins] - Browserify plugins
 * @returns {function} Defined task
 */
'use strict'

const co = require('co')
const path = require('path')
const browserify = require('browserify')
const amkdirp = require('amkdirp')
const { Readable } = require('stream')
const { byPattern } = require('pon-task-compile')
const { isProduction } = require('asenv')

/** @lends define */
function define (srcDir, destDir, options = {}) {
  let {
    pattern = '*.js',
    cacheFile = 'tmp/browser-cache.json',
    debug = !isProduction(),
    watchDelay = 100,
    plugins = []
  } = options

  const compiler = (code, inputSourceMap = null, options = {}) => co(function * () {
    yield amkdirp(path.dirname(cacheFile))
    let readable = new Readable()
    readable.push(code)
    readable.push(null)
    let { src } = options
    let b = browserify(readable, {
      cacheFile,
      cache: {},
      debug,
      basedir: path.dirname(src),
      packageCache: {},
      fullPaths: false
    })
    for (let [ plugin, pluginsOption ] of plugins) {
      b.plugin(plugin, pluginsOption)
    }
    return yield new Promise((resolve, reject) =>
      b.bundle((err, src) => err ? reject(err) : resolve([ src ])
      )
    )
  })

  let task = byPattern(srcDir, destDir, compiler, {
    pattern,
    watchDelay,
    namer: (filename) => filename.replace(/\.jsx$/, '.js')
  })

  let { watch } = task

  return Object.assign(function browser (ctx) {
    return task(ctx)
  }, { watch })
}

module.exports = define


