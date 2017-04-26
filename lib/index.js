/**
 * Pon task to bundle browser script
 * @module pon-task-browser
 * @version 1.1.3
 */

'use strict'

const define = require('./define')
const plugins = require('./plugins')

let lib = define.bind(this)

Object.assign(lib, define, {
  define,
  plugins
})

module.exports = lib
