'use strict'

const { foo } = require('./mock-dep')
const asenv = require('asenv')

const path = require('path')

console.log(foo(), asenv.getEnv())

global.foo2 = 1

console.log(path.dirname('foo/bar'))
