'use strict'

exports.foo = () => 'This is foo!'

if (process.env.NODE_ENV === 'development') {
  console.log('Yes, this is development')
}