'use strict'

const { app, Menu, Tray } = require('electron')
const { start, stop } = require('hyperdrive-daemon/manager')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

let tray
let daemonRunning = false

const startDaemon = async () => {
  const { opts } = await start()
  daemonRunning = true
  updateTray()
  return opts.endpoint
}

const stopDaemon = async () => {
  await stop()
  daemonRunning = false
  updateTray()
}

const updateTray = () => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Hyperdrive Daemon is ${daemonRunning ? 'ON' : 'OFF'}`,
      enabled: false
    },
    daemonRunning
      ? { label: 'Turn OFF', click: stopDaemon }
      : { label: 'Turn ON', click: startDaemon }
  ])
  tray.setContextMenu(contextMenu)
}

app.on('ready', () => {
  tray = new Tray(`${__dirname}/icons/tray@4x.png`)
  tray.setToolTip('This is my application.')
  updateTray()
})

const main = async () => {
  await startDaemon()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
