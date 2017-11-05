'use strict'

console.log('!!!hoge')

if (process.env.NODE_ENV === 'production') {
  module.exports = require('fs')
} else {

}
