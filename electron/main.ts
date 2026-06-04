import { join } from 'path';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';

process.env.DIST = join(__dirname, '../dist');

// Hardware acceleration disabled for ease of development
// Performance impact is negligible for this app
app.disableHardwareAcceleration();

let win: BrowserWindow | null;

function createWindow() {
    // Window title defined in index.html
    win = new BrowserWindow({
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    const url = process.env.VITE_DEV_SERVER_URL;
    if (url) {
        win.loadURL(url);
        win.webContents.openDevTools();
    } else {
        win.loadFile(join(process.env.DIST, 'index.html'));
    }
}

// IPC handlers for file/folder dialogs
ipcMain.handle('select-question-file', async () => {
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
        title: 'Select Question File',
        filters: [{ name: 'Question Files', extensions: ['csv', 'xlsx'] }],
        properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length !== 1) return null;
    return result.filePaths[0];
});

ipcMain.handle('select-media-folder', async () => {
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
        title: 'Select Media File',
        properties: ['openDirectory']
    });

    if (result.canceled || result.filePaths.length !== 1) return null;
    return result.filePaths[0];
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
