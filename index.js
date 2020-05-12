'use strict'

const {
  app,
  Menu,
  Tray,
  Notification,
  shell,
  systemPreferences
} = require('electron')
const manager = require('hyperdrive-daemon/manager')
const HyperdriveDaemon = require('hyperdrive-daemon')
const setupFuse = require('./lib/setup-fuse')
const { HyperdriveClient } = require('hyperdrive-daemon-client')
const constants = require('hyperdrive-daemon-client/lib/constants')
const { promises: fs } = require('fs')
const Store = require('electron-store')
const unhandled = require('electron-unhandled')
const sleep = require('yoctodelay')

unhandled()

if (app.isPackaged && !app.requestSingleInstanceLock()) {
  app.quit()
  process.exit()
}

let tray
let daemon
let client
let daemonStatus = 'Off'
let fuseEnabled = false
const store = new Store()

const openDrives = async () => {
  const realPath = await fs.readlink(`${app.getPath('home')}/Hyperdrive`)
  await shell.openExternal(`file://${realPath}`)
}

const showHelp = async () => {
  await shell.openExternal(
    'https://github.com/libscie/hyperdaemon/blob/master/README.md#usage'
  )
}

const connectToDaemon = async () => {
  client = new HyperdriveClient()
  await client.ready()

  const status = await client.status()
  if (status.fuseAvailable) fuseEnabled = true

  setDaemonStatus('On')
}

const isDaemonRunning = async () => {
  try {
    await connectToDaemon()
    setDaemonStatus('On')
    return true
  } catch (_) {
    setDaemonStatus('Off')
    return false
  }
}

const setDaemonStatus = (status, { notify } = {}) => {
  if (status !== daemonStatus) {
    console.log(status)
  }
  if (notify) {
    const n = new Notification({
      title: 'Hyper Daemon',
      body: `Daemon is ${status}`,
      silent: true
    })
    n.on('click', openDrives)
    n.show()
  }

  daemonStatus = status
  updateTray()
}

const startDaemon = async () => {
  if (await isDaemonRunning()) return

  setDaemonStatus('starting')
  daemon = new HyperdriveDaemon({
    storage: constants.root,
    metadata: null
  })
  await daemon.start()
  await connectToDaemon()

  setDaemonStatus('On', { notify: true })
}

const stopDaemon = async () => {
  setDaemonStatus('stopping')
  client.close()
  if (daemon) {
    await daemon.stop()
    daemon = null
  } else {
    await manager.stop()
  }
  setDaemonStatus('Off', { notify: true })
}

const updateTray = () => {
  if (!tray) return
  tray.setImage(getTrayImagePath())
  const template = [
    {
      label: `Hyper Daemon: ${daemonStatus}`,
      enabled: false
    },
    daemonStatus === 'On'
      ? { label: 'Turn Daemon Off', click: stopDaemon }
      : { label: 'Turn Daemon On', click: startDaemon }
  ]
  if (daemonStatus === 'On') {
    template.push({ type: 'separator' })
    if (fuseEnabled) {
      template.push({ label: 'FUSE is enabled', enabled: false })
    } else {
      template.push({
        label: 'Setup FUSE',
        click: async () => {
          await setupFuse()
          stopDaemon()
          startDaemon()
        }
      })
    }
    template.push({ label: 'Open Drives', click: openDrives })
  }
  template.push({ type: 'separator' })
  template.push({
    type: 'checkbox',
    label: 'Launch on Login',
    checked: app.getLoginItemSettings().openAtLogin,
    click: () => {
      app.setLoginItemSettings({
        openAtLogin: !app.getLoginItemSettings().openAtLogin
      })
    }
  })
  template.push({ type: 'separator' })
  template.push({ label: 'Help', click: showHelp })
  template.push({ type: 'separator' })
  template.push({ label: 'Quit', click: () => app.quit() })
  const menu = Menu.buildFromTemplate(template)
  tray.setContextMenu(menu)
}

const getTrayImagePath = () => {
  const folder = systemPreferences.isDarkMode() ? 'dark' : 'light'
  const file = daemonStatus === 'On' ? 'enabled' : 'disabled'
  return `${__dirname}/build/tray/${folder}/${file}@4x.png`
}

app.on('ready', async () => {
  app.dock.hide()
  tray = new Tray(getTrayImagePath())
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
  while (true) {
    await sleep(1000)
    await isDaemonRunning()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
