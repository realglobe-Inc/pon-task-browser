'use strict'

const pon = require('pon')
const browser = require('pon-task-browser')

async function tryExample () {
  let run = pon({
    'ui:bundle': browser('ui/entrypoints', 'public/js', {
      pattern: '*.js'
    })
  })

  run('ui:bundle')
}

tryExample()
