'use strict'

const {foo} = require('./mock-dep')
const asenv = require('asenv')

console.log(foo(), asenv.getEnv())
