'use strict'

const {unlessProduction, isDevelopment} = require('the-check')
console.log('!!!hoge')

function hoge () {
  return process.env.NODE_ENV
}

if (process.env.NODE_ENV === 'production') {
  module.exports = require('fs')
} else {

}

console.log('!!is hoge ', hoge)

unlessProduction(() => {
  console.log('yes, not in production')
})