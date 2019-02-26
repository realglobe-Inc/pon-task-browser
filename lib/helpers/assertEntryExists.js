/**
 * @function assertEntryExists
 */
'use strict'

const { statAsync } = require('asfs')

/** @lends assertEntryExists */
async function assertEntryExists(src) {
  if (typeof src === 'object') {
    for (const s of Object.values(src)) {
      await assertEntryExists(s)
    }
    return
  }
  const stat = await statAsync(src).catch((err) => null)
  if (!stat) {
    throw new Error(`[pon-task-browser] entry not exists: ${src}`)
  }
}

module.exports = assertEntryExists
