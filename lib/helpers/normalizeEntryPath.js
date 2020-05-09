
'use strict'

const path = require('path')

/**
 * @function normalizeEntryPath
 */
function normalizeEntryPath(filename, options = {}) {
  const { context } = options
  if (typeof filename === 'object') {
    return Object.assign({},
      ...Object.entries(filename).map(([name, filename]) => ({
        [name]: normalizeEntryPath(filename, options),
      }))
    )
  }
  const isAbsolute = /^\//.test(filename)
  if (isAbsolute) {
    return filename
  }
  return context ? path.resolve(context, filename) : filename
}

module.exports = normalizeEntryPath
