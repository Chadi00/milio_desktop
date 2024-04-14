const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store(); // Correct instantiation

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 550,
    height: 772,
    resizable: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('close-app', () => {
  app.quit();
});

app.setAsDefaultProtocolClient('myapp');

ipcMain.on('open-auth-window', (event, oauthUrl) => {
  let authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  authWindow.loadURL(oauthUrl);
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  mainWindow.webContents.send('handle-oauth-callback', url);
});

ipcMain.on('token-received', (event, token) => {
  store.set('oauthToken', token); // Correctly using store instance
  console.log('Token received and stored:', token);
  mainWindow.webContents.send('oauth-token-received', token);
});

