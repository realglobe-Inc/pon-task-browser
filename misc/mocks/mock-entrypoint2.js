'use strict'

const asenv = require('asenv')
const dep = require('./mock-dep')

console.log('This is entrypoint 2', asenv.getEnv(), dep.foo())
