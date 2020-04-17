'use strict'

const { app, Menu, Tray, Notification, shell } = require('electron')
const HyperdriveDaemon = require('hyperdrive-daemon')
const setupFuse = require('./lib/setup-fuse')
const { HyperdriveClient } = require('hyperdrive-daemon-client')
const constants = require('hyperdrive-daemon-client/lib/constants')
const { promises: fs } = require('fs')
const Store = require('electron-store')

if (app.isPackaged && !app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

let tray
let daemon
let client
let daemonStatus = 'starting'
let fuseEnabled = false
const store = new Store()

const openDrives = async () => {
  const realPath = await fs.readlink(`${app.getPath('home')}/Hyperdrive`)
  await shell.openExternal(`file://${realPath}`)
}

const showHelp = async () => {
  await shell.openExternal(
    'https://github.com/hypergraph-xyz/hyperdrive-daemon-app/blob/master/README.md#usage'
  )
}

const setDaemonStatus = (status, { notify } = {}) => {
  daemonStatus = status
  updateTray()
  if (notify) {
    const n = new Notification({
      title: 'Hyperdrive Daemon',
      body: `Daemon is ${daemonStatus}`,
      silent: true
    })
    n.on('click', openDrives)
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
    template.push({ label: 'Open drives', click: openDrives })
  }
  template.push({ type: 'separator' })
  template.push({ label: 'Help', click: showHelp })
  template.push({ type: 'separator' })
  template.push({ label: 'Quit', click: () => app.quit() })
  const menu = Menu.buildFromTemplate(template)
  tray.setContextMenu(menu)
}

app.on('ready', async () => {
  app.dock.hide()
  tray = new Tray(`${__dirname}/icons/tray@4x.png`)
  tray.setToolTip('This is my application.')
  updateTray()

  if (!store.get('help-displayed')) {
    await showHelp()
    store.set('help-displayed', true)
  }
})
app.dock.hide()

process.once('SIGUSR2', async () => {
  if (client) client.close()
  if (daemon) await daemon.stop()
  process.kill(process.pid, 'SIGUSR2')
})

const main = async () => {
  await startDaemon()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
