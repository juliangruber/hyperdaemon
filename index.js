'use strict'

const { app, Menu, Tray, Notification } = require('electron')
const HyperdriveDaemon = require('hyperdrive-daemon')
const setupFuse = require('./lib/setup-fuse')
const { HyperdriveClient } = require('hyperdrive-daemon-client')
const constants = require('hyperdrive-daemon-client/lib/constants')

if (app.isPackaged && !app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

let tray
let daemon
let client
let daemonStatus = 'starting'
let fuseEnabled = false

process.once('SIGUSR2', async () => {
  if (client) client.close()
  if (daemon) await daemon.stop()
  process.kill(process.pid, 'SIGUSR2')
})

const setDaemonStatus = (status, { notify } = {}) => {
  daemonStatus = status
  updateTray()
  if (notify) {
    const n = new Notification({
      title: 'Hyperdrive Daemon',
      body: `Daemon is ${daemonStatus}`,
      silent: true
    })
    n.show()
  }
}

const startDaemon = async () => {
  setDaemonStatus('starting')
  daemon = new HyperdriveDaemon({
    storage: constants.root,
    metadata: null
  })
  await daemon.start()

  setDaemonStatus('connecting')
  client = new HyperdriveClient()
  await client.ready()

  const status = await client.status()
  if (status.fuseAvailable) fuseEnabled = true

  setDaemonStatus('ON', { notify: true })
}

const stopDaemon = async () => {
  setDaemonStatus('stopping')
  client.close()
  await daemon.stop()
  setDaemonStatus('OFF', { notify: true })
}

const updateTray = () => {
  if (!tray) return
  const template = [
    {
      label: `Hyperdrive Daemon is ${daemonStatus}`,
      enabled: false
    },
    daemonStatus === 'ON'
      ? { label: 'Turn OFF', click: stopDaemon }
      : { label: 'Turn ON', click: startDaemon }
  ]
  if (daemonStatus === 'ON') {
    template.push({ type: 'separator' })
    if (fuseEnabled) {
      template.push({ label: 'FUSE is enabled', enabled: false })
    } else {
      template.push({
        label: 'Setup FUSE',
        click: async () => {
          await setupFuse()
          fuseEnabled()
          updateTray()
        }
      })
    }
  }
  template.push({ type: 'separator' })
  template.push({ label: 'Quit', click: () => app.quit() })
  const menu = Menu.buildFromTemplate(template)
  tray.setContextMenu(menu)
}

app.on('ready', () => {
  app.dock.hide()
  tray = new Tray(`${__dirname}/icons/tray@4x.png`)
  tray.setToolTip('This is my application.')
  updateTray()
})
app.dock.hide()

startDaemon().catch(err => {
  console.error(err)
  process.exit(1)
})
