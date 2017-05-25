'use strict'

/**
 * Convert not env
 * @param {Object} env = process.env
 * @see https://github.com/hughsk/envify
 */
exports.envify = (env = process.env) =>
  require('envify/custom')(process.env)
