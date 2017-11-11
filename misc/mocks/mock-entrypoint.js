'use strict'

const {foo} = require('./mock-dep')

console.log(foo())

require('./mock-to-ignore')
require('./mock-env-index')
