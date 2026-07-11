import { join, resolve, extname } from 'path';
import { createReadStream, statSync } from 'fs';
import { createServer, type Server } from 'http';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { Board } from '../shared/board';
import { parseQuestionFile, validateMediaFiles } from './parseFile';

process.env.DIST = join(__dirname, '../dist');

// Hardware acceleration disabled for ease of development
// Performance impact is negligible for this app
app.disableHardwareAcceleration();

/** MIME types for media files this app supports */
const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
};

/** Absolute path to the user-selected media folder, set via the folder dialog */
let mediaFolderPath: string | null = null;
let mediaServer: Server | null = null;
let mediaServerPort: number | null = null;
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
    
    mediaFolderPath = result.filePaths[0];
    return mediaFolderPath;
});

// IPC handlers for reading and validating files
ipcMain.handle('parse-question-file', async (_event, filePath: string) => {
    try {
        return { boards: parseQuestionFile(filePath) };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { error: `Failed to parse question file: ${message}` };
    }
});

ipcMain.handle('validate-media-files', async (_event, boards: Board[], mediaFolder: string) => {
    try {
        return validateMediaFiles(boards, mediaFolder);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return ["ERROR!!!!", message]
    }
});

// Return the medai server port so the renderer can build media URLs
ipcMain.handle('get-media-port', () => mediaServerPort);

// Relay audience state from host to audience window
ipcMain.on('audience-state', (_event, state) => {
    if (audienceWin && !audienceWin.isDestroyed())
        audienceWin.webContents.send('audience-state', state);
});

// Relay pause/resume from host to audience window
ipcMain.on('audience-pause', (_event, paused: boolean) => {
    if (audienceWin && !audienceWin.isDestroyed())
        audienceWin.webContents.send('audience-pause', paused);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
    mediaServer = createServer((req, res) => {
        if (!mediaFolderPath || !req.url) {
            res.writeHead(404).end();
            return;
        }

        const filename = decodeURIComponent(req.url.replace(/^\//, ''));

        // Path traversal guard
        const resolved = resolve(mediaFolderPath, filename);
        if (!resolved.startsWith(resolve(mediaFolderPath))) {
            res.writeHead(403).end();
            return;
        }

        let stat;
        try {
            stat = statSync(resolved);
        } catch {
            res.writeHead(404).end();
            return;
        }

        const totalSize = stat.size;
        const mimeType = MIME_TYPES[extname(resolved).toLowerCase()] ?? 'application/octet-stream';

        // Handle range requests (required for <video> playback)
        const rangeHeader = req.headers.range;
        if (rangeHeader) {
            const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            const start = match ? parseInt(match[1], 10) : 0;
            const end = match && match[2] ? parseInt(match[2], 10) : totalSize - 1;

            if (start >= totalSize) {
                res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` }).end();
                return;
            }

            res.writeHead(206, {
                'Content-Type': mimeType,
                'Content-Length': end - start + 1,
                'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                'Accept-Ranges': `bytes`,
            });
            createReadStream(resolved, { start, end }).pipe(res);
            return;
        }

        res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': totalSize,
            'Accept-Ranges': 'bytes',
        });
        createReadStream(resolved).pipe(res);
    });

    // Listen on a ranodm available port (port 0), localhost only
    mediaServer.listen(0, '127.0.0.1', () => {
        const addr = mediaServer!.address();
        if (addr && typeof addr !== 'string')
            mediaServerPort = addr.port;
    });

    createWindows();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
});
