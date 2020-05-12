'use strict'

const path = require('path')

/**
 * @function nameOfEntry
 */
function nameOfEntry (entry) {
  if (typeof entry === 'object') {
    const combined = Object.values(entry)
      .map((filename) => nameOfEntry.filename(filename))
      .join('&')
    return nameOfEntry.filename(combined)
  }
  return nameOfEntry.filename(entry)
}

nameOfEntry.filename = (filename) => {
  filename = path.relative(process.cwd(), filename)
  const basename = path.basename(filename, path.extname(filename))
  const dirname = path.dirname(filename)
  return [
    ...dirname.split(path.sep),
    ...basename.split(path.sep),
  ].join('-')
    .replace(/\./g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/, '')
}

module.exports = nameOfEntry
