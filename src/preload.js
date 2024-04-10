// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const softwareScript = require('./action_scripts/software');
const hardwareScript = require('./action_scripts/hardware');
const jwtDecode = require('jwt-decode'); 

// Expose in the main world
contextBridge.exposeInMainWorld('electronAPI', {
    softwareScript: softwareScript, // Expose softwareScript function to the renderer
    hardwareScript: hardwareScript,
    decodeJWT: (token) => jwtDecode(token), // Expose a function to decode JWT
});
