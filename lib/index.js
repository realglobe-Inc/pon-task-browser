/**
 * Pon task to bundle browser script
 * @module pon-task-browser
 * @version 4.0.0
 */

'use strict'

const define = require('./define')
const transforms = require('./transforms')
const plugins = require('./plugins')

let lib = define.bind(this)

Object.assign(lib, define, {
  define,
  transforms,
  plugins
})

module.exports = lib
