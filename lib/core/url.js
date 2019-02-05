'use strict'

const url = require('url')
const { URL } = require('whatwg-url')
module.exports = {
  ...url,
  URL,
}
