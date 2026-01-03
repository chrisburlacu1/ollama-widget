const { contextBridge, ipcRenderer } = require('electron');
const { CHANNELS } = require('../shared/constants');

contextBridge.exposeInMainWorld('api', {
    // Ollama API
    getAllData: () => ipcRenderer.invoke(CHANNELS.GET_ALL_DATA),
    getRunningModels: () => ipcRenderer.invoke(CHANNELS.GET_OLLAMA_DATA),
    getAvailableModels: () => ipcRenderer.invoke(CHANNELS.GET_AVAILABLE_MODELS),
    getModelDetails: (name) => ipcRenderer.invoke(CHANNELS.GET_MODEL_DETAILS, name),
    stopModel: (name) => ipcRenderer.invoke(CHANNELS.STOP_MODEL, name),
    
    // Window Controls
    minimize: () => ipcRenderer.invoke(CHANNELS.WINDOW_MINIMIZE),
    close: () => ipcRenderer.invoke(CHANNELS.WINDOW_CLOSE),
    toggleAlwaysOnTop: (flag) => ipcRenderer.invoke(CHANNELS.WINDOW_TOGGLE_TOP, flag),
    
    // System Stats
    getSystemStats: () => ipcRenderer.invoke(CHANNELS.GET_SYSTEM_STATS),
    
    // Listeners
    onAlwaysOnTopChanged: (callback) => ipcRenderer.on(CHANNELS.WINDOW_ON_TOP_CHANGED, (_, value) => callback(value)),
    
    // Utilities
    openExternal: (url) => require('electron').shell.openExternal(url)
});