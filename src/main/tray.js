const { Tray, Menu, app } = require('electron');
const path = require('path');
const { CHANNELS } = require('../shared/constants');

let tray = null;

function setupTray(mainWindow) {
    if (tray) return;

    // Use absolute path relative to the bundled app
    const iconPath = path.join(__dirname, '../assets/icon.png');
    
    // Note: We might need to handle the icon creation in the main file to safely check for existence,
    // but the Tray constructor handles strings too.
    tray = new Tray(iconPath);
    tray.setToolTip('Ollama Widget');

    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show/Hide', 
            click: () => toggleWindow(mainWindow)
        },
        { type: 'separator' },
        { 
            label: 'Always on Top', 
            type: 'checkbox', 
            checked: true,
            click: (item) => {
                mainWindow.setAlwaysOnTop(item.checked);
                mainWindow.webContents.send(CHANNELS.WINDOW_ON_TOP_CHANGED, item.checked);
            }
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => toggleWindow(mainWindow));
}

function toggleWindow(mainWindow) {
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow.show();
    }
}

module.exports = { setupTray };