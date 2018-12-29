'use strict'

const { foo } = require('./mock-dep')
const asenv = require('asenv')

require('path')

console.log(foo(), asenv.getEnv())

global.foo2 = 1
