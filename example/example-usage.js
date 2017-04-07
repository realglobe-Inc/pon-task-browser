'use strict'

const pon = require('pon')
const browser = require('pon-task-browser')
const { cssModule } = browser.plugins

async function tryExample () {
  let run = pon({
    'ui:bundle': browser('ui/entrypoints', 'public/js', {
      pattern: '*.js',
      plugins: [ cssModule('ui/stylesheets', 'public/css/bundle.css') ]
    })
  })

  run('ui:bundle')
}

tryExample()
