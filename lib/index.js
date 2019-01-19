/**
 * Pon task to bundle browser script
 * @module pon-task-browser
 * @version 7.1.3
 */

'use strict'

const define = require('./define')

const lib = define.bind(this)

Object.assign(lib, define, {
  define,
})

module.exports = lib
