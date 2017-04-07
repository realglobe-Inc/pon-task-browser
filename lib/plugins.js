'use strict'

/**
 * Define plugin for css module
 * @param {string} rootDir - Root directory of styles
 * @param {string} output - Out put file path
 * @returns {Array} - Plugin
 */
exports.cssModule = (rootDir, output) => [ require('css-modulesify'), { rootDir, output } ]
