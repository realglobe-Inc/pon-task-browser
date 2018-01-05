'use strict'

/**
 * Convert not env
 * @param {Object} env = process.env
 * @see https://github.com/hughsk/envify
 */
exports.envify = (env = process.env) =>
  require('envify/custom')(env)

/**
 * Using roolup
 * @returns {rollupify}
 */
exports.rollupify = () =>
  require('rollupify')

exports.babelify = () =>
  require('babelify').configure({
    presets: [
      ['env', {targets: {browsers: ['> 1%']}}]
    ]
  })