'use strict'

const hyperfuse = require('hyperdrive-fuse')

hyperfuse.configure(err => {
  if (err) process.exit(1)
  process.exit(0)
})