const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipc');
const { setupTray } = require('./tray');

let mainWindow = null;

function createWindow() {
    const iconPath = path.join(__dirname, '../assets/icon.png');
    // Helper to safely load icon
    let icon = null;
    try { icon = nativeImage.createFromPath(iconPath); } catch (e) {}

    mainWindow = new BrowserWindow({
        width: 340,
        height: 500,
        minWidth: 300,
        minHeight: 200,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        alwaysOnTop: true,
        resizable: true,
        hasShadow: true,
        show: false, // OPTIMIZATION: Don't show until ready
        icon: (icon && !icon.isEmpty()) ? icon : undefined,
        webPreferences: {
            // SECURITY: Context Isolation Enabled
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false, // Ensure local requires work in preload
            preload: path.join(__dirname, '../preload/index.js')
        }
    });

    // Load the HTML from the renderer directory
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    // OPTIMIZATION: Show window only when content is loaded to prevent white flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    
    // Register IPC handlers
    registerIpcHandlers(mainWindow);
    
    // Setup Tray
    setupTray(mainWindow);

    // Cleanup
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App Lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});