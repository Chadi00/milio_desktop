// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const softwareScript = require('./action_scripts/software');

contextBridge.exposeInMainWorld('electronAPI', {
    softwareScript: softwareScript // Expose softwareScript function to the renderer
});