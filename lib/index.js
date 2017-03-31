/**
 * Pon task to bundle browser script
 * @module pon-task-browser
 * @version 1.0.1
 */

'use strict'

const define = require('./define')

let lib = define.bind(this)

Object.assign(lib, define, {
  define
})

module.exports = lib
