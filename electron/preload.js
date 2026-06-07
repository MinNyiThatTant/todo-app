const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific electron APIs
contextBridge.exposeInMainWorld('electronAPI', {
    // Add any IPC methods here if needed
});