// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const softwareScript = require('./action_scripts/software');
const jwtDecode = require('jwt-decode'); // Require jwt-decode here

// Expose in the main world
contextBridge.exposeInMainWorld('electronAPI', {
    softwareScript: softwareScript, // Expose softwareScript function to the renderer
    decodeJWT: (token) => jwtDecode(token), // Expose a function to decode JWT
});
