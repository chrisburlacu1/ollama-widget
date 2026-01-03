const { ipcMain } = require('electron');
const { CHANNELS } = require('../shared/constants');

function registerIpcHandlers(mainWindow) {
    // Window Controls
    ipcMain.handle(CHANNELS.WINDOW_MINIMIZE, () => mainWindow.minimize());
    ipcMain.handle(CHANNELS.WINDOW_CLOSE, () => mainWindow.close());
    ipcMain.handle(CHANNELS.WINDOW_TOGGLE_TOP, (e, flag) => {
        mainWindow.setAlwaysOnTop(flag);
        return flag;
    });

    // System Stats (Legacy/Individual)
    ipcMain.handle(CHANNELS.GET_SYSTEM_STATS, async () => {
        // ... (existing logic if needed, or we can move it inside GET_ALL_DATA)
        return { cpuPercent: 0 }; // Placeholder if we move logic
    });

    // OPTIMIZATION: Batch Data Fetching
    ipcMain.handle(CHANNELS.GET_ALL_DATA, async () => {
        const [running, available] = await Promise.all([
            fetchJson('http://localhost:11434/api/ps'),
            fetchJson('http://localhost:11434/api/tags')
        ]);
        return { running, available };
    });

    // Ollama API
    ipcMain.handle(CHANNELS.GET_OLLAMA_DATA, async () => {
        return await fetchJson('http://localhost:11434/api/ps');
    });

    ipcMain.handle(CHANNELS.GET_AVAILABLE_MODELS, async () => {
        return await fetchJson('http://localhost:11434/api/tags');
    });

    ipcMain.handle(CHANNELS.GET_MODEL_DETAILS, async (e, name) => {
        return await fetchJson('http://localhost:11434/api/show', 'POST', { name });
    });

    ipcMain.handle(CHANNELS.STOP_MODEL, async (e, name) => {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: name, keep_alive: 0 })
            });
            return { success: response.ok };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

async function fetchJson(url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = { registerIpcHandlers };