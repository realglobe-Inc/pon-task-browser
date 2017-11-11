/**
 * Pon task to bundle browser script
 * @module pon-task-browser
 * @version 3.0.6
 */

'use strict'

const define = require('./define')
const transforms = require('./transforms')

const lib = define.bind(this)

Object.assign(lib, define, {
  define,
  transforms
})

module.exports = lib
