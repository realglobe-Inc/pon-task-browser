/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const ponContext = require('pon-context')
const path = require('path')
const {ok} = require('assert')
const asleep = require('asleep')
const writeout = require('writeout')
const filedel = require('filedel')

describe('define', function () {
  this.timeout(13000)

  before(async () => {

  })

  after(async () => {

  })

  it('Define', async () => {
    await filedel(`${__dirname}/../tmp/*.json`) // Clear cache
    const ctx = ponContext()
    const task = define(
      `${__dirname}/../misc/mocks/mock-entrypoint.js`,
      `${__dirname}/../tmp/bundle.js`,
    )
    ok(task)

    await Promise.resolve(task(ctx))
  })

  it('Code splitting', async () => {
    const ctx = ponContext()
    const task = define(
      {
        e3: `${__dirname}/../misc/mocks/mock-entrypoint3.js`,
        e2: `${__dirname}/../misc/mocks/mock-entrypoint2.js`,
      },
      `${__dirname}/../tmp/bundles/[name]-bundle.js`,
      {
        split: true,
      }
    )
    ok(task)
    await Promise.resolve(task(ctx))
  })

  it('Define all', async () => {
    await filedel(`${__dirname}/../tmp/*.json`) // Clear cache
    const ctx = ponContext()
    const task = define.all(
      `${__dirname}/../misc/mocks`,
      `${__dirname}/../tmp/all`,
      {
        pattern: 'mock-entrypoint.js',
      }
    )
    ok(task)

    await Promise.resolve(task(ctx))

  })

  it('Watch', async () => {
    let ctx = ponContext({})
    let src = `${__dirname}/../tmp/testing-watching/src/foo.js`
    let dest = `${__dirname}/../tmp/testing-watching/dest/foo.js`
    await writeout(src, 'module.exports = "hoge"', {mkdirp: true})
    await asleep(100)
    const close = define(src, dest, {watchDelay: 1}).watch(ctx)
    await writeout(src, 'module.exports = "fuge"', {mkdirp: true})
    await asleep(200)
    await writeout(src, 'module.exports = "moge"', {mkdirp: true})
    await asleep(200)
    close()
  })
})

/* global describe, before, after, it */
