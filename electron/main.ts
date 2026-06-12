import { join } from 'path';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { parseQuestionFile } from './parseQuestion';

process.env.DIST = join(__dirname, '../dist');

// Hardware acceleration disabled for ease of development
// Performance impact is negligible for this app
app.disableHardwareAcceleration();

let hostWin: BrowserWindow | null;
let audienceWin: BrowserWindow | null;

const preload = join(__dirname, 'preload.js');

function createWindows() {
    hostWin = new BrowserWindow({
        title: 'Host',
        webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    audienceWin = new BrowserWindow({
        title: 'Audience',
        webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    const url = process.env.VITE_DEV_SERVER_URL;
    if (url) {
        hostWin.loadURL(url);
        hostWin.webContents.openDevTools();
        audienceWin.loadURL(`${url}?window=audience`);
    } else {
        hostWin.loadFile(join(process.env.DIST, 'index.html'), { query: { window: 'host' } });
        audienceWin.loadFile(join(process.env.DIST, 'index.html'), { query: { window: 'audience' } });
    }

    // Close both windows when either is closed
    hostWin.on('closed', () => {
        hostWin = null;
        if (audienceWin && !audienceWin.isDestroyed()) audienceWin.close();
    });
    audienceWin.on('closed', () => {
        audienceWin = null;
        if (hostWin && !hostWin.isDestroyed()) hostWin.close();
    });
}

// IPC handlers for file/folder dialogs
ipcMain.handle('select-question-file', async () => {
    if (!hostWin) return null;

    const result = await dialog.showOpenDialog(hostWin, {
        title: 'Select Question File',
        filters: [{ name: 'Question Files', extensions: ['csv', 'xlsx'] }],
        properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length !== 1) return null;
    return result.filePaths[0];
});

ipcMain.handle('select-media-folder', async () => {
    if (!hostWin) return null;

    const result = await dialog.showOpenDialog(hostWin, {
        title: 'Select Media File',
        properties: ['openDirectory']
    });

    if (result.canceled || result.filePaths.length !== 1) return null;
    return result.filePaths[0];
});

ipcMain.handle('parse-question-file', async (_event, filePath: string) => {
    try {
        return { boards: parseQuestionFile(filePath) };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { error: `Failed to parse question file: ${message}` };
    }
});

// Relay audience state from host to audience window
ipcMain.on('audience-state', (_event, state) => {
    if (audienceWin && !audienceWin.isDestroyed())
        audienceWin.webContents.send('audience-state', state);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
    createWindows();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
});
