const { ipcRenderer } = require('electron');

function closeMilio() {
    ipcRenderer.send('close-app'); 
}

module.exports = closeMilio;