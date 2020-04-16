'use strict'

const { app, Menu, Tray } = require('electron')
const { start, stop } = require('hyperdrive-daemon/manager')
const setupFuse = require('./lib/setup-fuse')

if (app.isPackaged && !app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

let tray
let daemonRunning = false
let fuseEnabled = false

const startDaemon = async () => {
  daemonRunning = true
  updateTray()

  const { opts } = await start()

  if (opts.mountpoint) fuseEnabled = true
  updateTray()

  return opts.endpoint
}

const stopDaemon = async () => {
  daemonRunning = false
  updateTray()
  await stop()
}

const updateTray = () => {
  if (!tray) return
  const template = [
    {
      label: `Hyperdrive Daemon is ${daemonRunning ? 'ON' : 'OFF'}`,
      enabled: false
    },
    daemonRunning
      ? { label: 'Turn OFF', click: stopDaemon }
      : { label: 'Turn ON', click: startDaemon }
  ]
  if (daemonRunning) {
    template.push({ type: 'separator' })
    if (fuseEnabled) {
      template.push({ label: 'FUSE enabled', enabled: false })
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

const main = async () => {
  await startDaemon()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
