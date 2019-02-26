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
      nameOfEntry('x/entrypoint.js', {}),
      'x-entrypoint'
    )
    equal(
      nameOfEntry({
        bundle: 'ui/entrypoint.js',
        bundle2: 'ui/entrypoint2.js',
      }, {}),
      'ui-entrypoint&ui-entrypoint2',
    )
    equal(
      nameOfEntry(__filename),
      'test-nameOfEntry_test',
    )
  })
})

/* global describe, before, after, it */
