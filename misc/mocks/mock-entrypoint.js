'use strict'

const {foo} = require('./mock-dep')
const hoge = require('./css/hoge.css')

console.log(foo())

require('./mock-to-ignore')
require('./mock-env-index')
