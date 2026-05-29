import { join } from 'path'
import { app, BrowserWindow } from 'electron'

process.env.DIST = join(__dirname, '../dist')

// Hardware acceleration disabled for ease of development
// Performance impact is negligible for this app
app.disableHardwareAcceleration()

let win: BrowserWindow | null

function createWindow() {
  // Window title defined in index.html
  win = new BrowserWindow()

  const url = process.env.VITE_DEV_SERVER_URL
  if (url) {
    win.loadURL(url)
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
