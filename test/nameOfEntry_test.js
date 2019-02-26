/**
 * Test case for nameOfEntry.
 * Runs with mocha.
 */
'use strict'

const nameOfEntry = require('../lib/helpers/nameOfEntry.js')
const { equal } = require('assert').strict

describe('name-of-entry', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Name of entry', async () => {
    equal(
      nameOfEntry('x/entrypoint.js', {
        context: 'client/shim',
      }),
      'x-entrypoint'
    )
    equal(
      nameOfEntry({
        bundle: 'ui/entrypoint.js',
        bundle2: 'ui/entrypoint2.js',
      }, {
        context: 'client/shim'
      }),
      'ui-entrypoint&ui-entrypoint2',
    )
  })
})

/* global describe, before, after, it */
