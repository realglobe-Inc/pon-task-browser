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
const {byPattern} = require('pon-task-compile')
const {isProduction} = require('asenv')
const {EOL} = require('os')

const normalizeStringArray = (values) => [].concat(values)
  .reduce((array, v) => array.concat(v.split(',')), [])
  .filter(Boolean)

/** @lends define */
function define (src, dest, options = {}) {
  const {
    cacheFile = `tmp/cache/${path.basename(dest, path.extname(dest))}-cache-:env.json`,
    debug = !isProduction(),
    watchDelay = 100,
    ignores = [],
    noParse = [],
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

  const compiler = async (readStream, inputSourceMap = null, options = {}) => {

    const stat = await statAsync(src).catch((err) => null)
    if (!stat) {
      throw new Error(`src not exists: ${src}`)
    }

    const browserify = require('browserify')
    const browserifyIncremental = require('browserify-incremental')

    const cacheFileResolved = fileNameForEnv(cacheFile)
    await amkdirp(path.dirname(cacheFileResolved))
    await amkdirp(destDir)
    const basedir = options.src && path.dirname(options.src) || process.cwd()
    const b = browserify(readStream, {
      cache: {},
      debug,
      noParse,
      basedir: basedir,
      packageCache: {},
      fullPaths
    })
    browserifyIncremental(b, {cacheFile: cacheFileResolved})

    for (const [plugin, pluginsOption] of plugins) {
      b.plugin(plugin, pluginsOption)
    }

    for (const transform of transforms) {
      b.transform(transform)
    }

    for (const external of normalizeStringArray(externals)) {
      b.external(external)
    }

    for (const require of normalizeStringArray(requires)) {
      b.require(require)
    }

    for (const ignore of normalizeStringArray(ignores)) {
      b.ignore(path.resolve(basedir, ignore))
    }

    return [b.bundle(), null]
  }

  const task = byPattern(srcDir, destDir, compiler, {
    pattern: src ? path.basename(src) : null,
    watchDelay,
    watchTargets,
    namer: () => path.basename(dest),
    stream: true
  })

  const {watch} = task

  return Object.assign(
    function browser (ctx) {
      return task(ctx)
    },
    skipWatching ? {} : {watch},
    {
      /** Pon task print deps */
      async deps () {
        try {
          const cache = require(path.resolve(fileNameForEnv(cacheFile)))
          console.log(`
=== Browser Deps for ${path.relative(process.cwd(), dest)} ===    
${Object.keys(cache.modules).sort().join(EOL)}
          `)
        } catch (e) {
          console.warn(`Failed to load deps`, e)
        }
      }
    }
  )
}

define.all = (srcDir, destDir, options = {}) => {
  const {pattern = '+(*.jsx|*.js|*.mjs)'} = options
  return async function task (ctx) {
    const filenames = await aglob(pattern, {cwd: srcDir})
    for (const filename  of filenames) {
      const src = path.join(srcDir, filename)
      const dest = path.join(destDir, filename)
      await define(src, dest, options)(ctx)
    }
  }
}

module.exports = define
