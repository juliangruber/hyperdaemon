const hyperfuse = require('hyperdrive-fuse')
const { promises: fs } = require('fs')
const constants = require('hyperdrive-daemon-client/lib/constants')
const { join } = require('path')
const sudo = require('sudo-prompt')
const pkg = require('../package')
const { Notification } = require('electron')

module.exports = async () => {
  console.log('Configuring FUSE...')
  await makeRootDrive()
  try {
    await configureFuse()
    console.log('FUSE successfully configured:')
    const n = new Notification({
      title: 'Hyperdrive Daemon',
      body: 'FUSE set up!'
    })
    n.show()
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

  async function configureFuse (cb) {
    const configured = await new Promise((resolve, reject) => {
      hyperfuse.isConfigured((err, fuseConfigured) => {
        if (err) return reject(err)
        return resolve(fuseConfigured)
      })
    })
    if (configured) {
      console.log('Note: FUSE is already configured.')
    } else {
      return new Promise((resolve, reject) => {
        sudo.exec(
          `${process.execPath} ${join(__dirname, '../scripts/configure.js')}`,
          {
            name: pkg.name
          },
          err => {
            if (err) reject(err)
            else resolve()
          }
        )
      })
    }
  }

  async function makeRootDrive () {
    try {
      try {
        var symlinkStat = await fs.stat(constants.mountpoint)
        var mountpointStat = await fs.stat(constants.hiddenMountpoint)
      } catch (err) {
        if (err && err.errno !== -2) throw err
      }
      if (!mountpointStat) {
        await fs.mkdir(constants.hiddenMountpoint, { recursive: true })
        await fs.chown(
          constants.hiddenMountpoint,
          process.getuid(),
          process.getegid()
        )
      }
      if (!symlinkStat) {
        await fs.symlink(constants.hiddenMountpoint, constants.mountpoint)
      }
    } catch (err) {
      console.error('Could not create the FUSE mountpoint:')
      console.error(err)
    }
  }
}
