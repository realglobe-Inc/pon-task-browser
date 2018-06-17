'use strict'

console.log('!!!hoge')

function hoge () {
  return process.env.NODE_ENV
}

if (process.env.NODE_ENV === 'production') {
  module.exports = require('fs')
} else {

}

console.log('!!is hoge ', hoge)