const { ipcRenderer } = require('electron');

function closeMilio() {
    ipcRenderer.send('close-app'); // Send a message to the main process to close the app
}

module.exports = closeMilio;