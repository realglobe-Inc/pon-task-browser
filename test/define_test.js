/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const ponContext = require('pon-context')
const { ok } = require('assert')
const asleep = require('asleep')
const writeout = require('writeout')
const co = require('co')
const transforms = require('../lib/transforms')

describe('define', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Define', () => co(function * () {
    let ctx = ponContext()
    let task = define(
      `${__dirname}/../misc/mocks/mock-entrypoint.js`,
      `${__dirname}/../tmp/testing-bundle.js`,
      {
        plugins: [
          [ require('css-modulesify'), { rootDir: `${__dirname}/../misc/mocks/css`, output: './tmp/m-style.css' } ]
        ],
        transforms: [
          transforms.envify({ NODE_ENV: 'hoge' })
        ]
      }
    )
    ok(task)

    yield Promise.resolve(task(ctx))
  }))

  it('Watch', () => co(function * () {
    let ctx = ponContext({})
    let src = `${__dirname}/../tmp/testing-watching/src/foo.js`
    let dest = `${__dirname}/../tmp/testing-watching/dest/foo.js`
    yield writeout(src, 'module.exports = "hoge"', { mkdirp: true })
    yield asleep(100)
    define(src, dest, { watchDelay: 1 }).watch(ctx)
    yield writeout(src, 'module.exports = "fuge"', { mkdirp: true })
    yield asleep(200)
    yield writeout(src, 'module.exports = "moge"', { mkdirp: true })
    yield asleep(200)
  }))
})

/* global describe, before, after, it */
