'use strict'

const { app, Menu, Tray, Notification } = require('electron')
const { start } = require('hyperdrive-daemon/manager')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

let tray

app.on('ready', () => {
  tray = new Tray(`${__dirname}/icons/tray@4x.png`)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})

const main = async () => {
  const { opts } = await start()
  const n = new Notification({
    title: 'Hyperdrive Daemon',
    body: `Daemon listening on ${opts.endpoint}`,
    silent: true
  })
  n.show()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
