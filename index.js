'use strict'

const { app, Menu, Tray } = require('electron')

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
