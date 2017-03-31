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
 * @returns {function} Defined task
 */
'use strict'

const co = require('co')
const path = require('path')
const aglob = require('aglob')
const browserify = require('browserify')
const amkdirp = require('amkdirp')
const { Readable } = require('stream')
const compile = require('pon-task-compile')
const { isProduction } = require('asenv')
const watch = require('pon-task-watch')

/** @lends define */
function define (srcDir, destDir, options = {}) {
  let {
    pattern = '*.js',
    cacheFile = 'tmp/browser-cache.json',
    debug = !isProduction(),
    watchDelay = 100
  } = options

  const compiler = (code, inputSourceMap = null, options = {}) => {
    let readable = new Readable()
    readable.push(code)
    readable.push(null)
    let { src } = options
    return new Promise((resolve, reject) =>
      browserify(readable, {
        cache: {},
        debug,
        basedir: path.dirname(src),
        packageCache: {},
        fullPaths: false
      }).bundle((err, src) =>
        err ? reject(err) : resolve([ src ])
      )
    )
  }

  const resolvePaths = (filename) => ({
    src: path.resolve(srcDir, filename),
    dest: path.resolve(destDir, filename.replace(/\.jsx$/, '.js'))
  })

  function task (ctx) {
    return co(function * () {
      yield amkdirp(path.dirname(cacheFile))
      let filenames = yield aglob(pattern, { cwd: srcDir })
      let results = []
      for (let filename of filenames) {
        const { src, dest } = resolvePaths(filename)
        let result = yield compile(src, dest, compiler)(ctx)
        results.push(result)
      }
      return results
    })
  }

  return Object.assign(task,
    // Define sub tasks here
    {
      watch: (ctx) => co(function * () {
        return watch(
          [].concat(pattern).map((pattern) => path.join(srcDir, pattern)),
          (event, filename) => {
            const { src, dest } = resolvePaths(filename)
            compile(src, dest, compiler)(ctx)
          },
          {
            delay: watchDelay
          }
        )(ctx)
      })
    }
  )
}

module.exports = define


