'use strict'

/**
 * Convert not env
 * @param {Object} env = process.env
 * @see https://github.com/hughsk/envify
 */
exports.envify = (env) =>
  require('loose-envify/custom')(env || process.env)

