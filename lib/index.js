/**
 * Pon task to bundle browser script
 * @module pon-task-browser
 * @version 6.0.13
 */

'use strict'

const define = require('./define')

const lib = define.bind(this)

Object.assign(lib, define, {
  define,
})

module.exports = lib
