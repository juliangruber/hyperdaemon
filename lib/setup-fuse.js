'use strict'

// ported from
// https://github.com/hypercore-protocol/hyperdrive-daemon/blob/1dd6eb5aec9e0aadb8959fe481e49b84681d6b04/bin/commands/fuse-setup.js

const p = require('path')
const CONFIGURE_FUSE = [
  process.execPath,
  p.join(__dirname, '../scripts/configure.js')
]

const fs = require('fs').promises
const { spawn } = require('child_process')

const { HyperdriveClient } = require('hyperdrive-daemon-client')
const constants = require('hyperdrive-daemon-client/lib/constants')

const setup = async () => {
  try {
    var hyperfuse = require('hyperdrive-fuse')
  } catch (err) {}

  if (!hyperfuse) {
    console.warn(
      'FUSE installation failed. You will be unable to mount your hyperdrives.'
    )
    return
  }
  const flags = {
    user: process.geteuid(),
    group: process.getegid(),
    force: false
  }

  console.log('Configuring FUSE...')
  await makeRootDrive()
  try {
    await configureFuse()
    console.log('FUSE successfully configured:')
    console.log(
      '  * Your root drive will be mounted at ~/Hyperdrive when the daemon is next started.'
    )
    console.log(
      '  * If your mountpoint ever becomes unresponsive, try running `hyperdrive force-unmount`.'
    )
  } catch (err) {
    console.error('Could not configure the FUSE module:')
    console.error(err)
  }

  // If the daemon is running, refresh FUSE.
  try {
    const client = new HyperdriveClient()
    await client.ready()
    await client.refreshFuse()
  } catch (err) {
    // Emitting errors here would just be confusing, so suppress.
  }

  this.exit(0)

  async function configureFuse (cb) {
    const configured = await new Promise((resolve, reject) => {
      hyperfuse.isConfigured((err, fuseConfigured) => {
        if (err) return reject(err)
        return resolve(fuseConfigured)
      })
    })
    if (configured && !flags.force) {
      console.log('Note: FUSE is already configured.')
    } else {
      return new Promise((resolve, reject) => {
        const child = spawn('sudo', CONFIGURE_FUSE, {
          stdio: 'inherit'
        })
        child.on('error', reject)
        child.on('exit', code => {
          if (code) return reject(new Error(code))
          return resolve()
        })
      })
    }
  }

  async function makeRootDrive () {
    try {
      try {
        var mountpointStat = await fs.stat(constants.mountpoint)
      } catch (err) {
        if (err && err.code !== 'ENOENT') throw err
      }
      if (!mountpointStat) {
        await fs.mkdir(constants.mountpoint)
        // TODO: Uncomment when fuse-native path goes in.
        // await fs.writeFile(p.join(constants.mountpoint, 'HYPERDRIVE_IS_NOT_RUNNING'), '')
        await fs.chown(constants.mountpoint, flags.user, flags.group)
      } else {
        // If this is a symlink (legacy) delete it.
        try {
          await fs.unlink(constants.mountpoint)
        } catch (err) {
          // If Hyperdrive is a directory, this will error, but it doesn't matter.
        }
      }
    } catch (err) {
      console.error('Could not create the FUSE mountpoint:')
      console.error(err)
    }
  }
}

module.exports = setup
