const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();
const fetch = (url, options) => import('node-fetch').then(({ default: fetch }) => fetch(url, options));

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

ipcMain.on('token-received', async (event, token) => {
  store.set('oauthToken', token);
  console.log('Token received and stored:', token);

  try {
    const recipient = await mainWindow.webContents.executeJavaScript('localStorage.getItem("recipientEmail")');
    const subject = await mainWindow.webContents.executeJavaScript('localStorage.getItem("emailSubject")');
    const content = await mainWindow.webContents.executeJavaScript('localStorage.getItem("emailContent")');
    const storedToken = await mainWindow.webContents.executeJavaScript('localStorage.getItem("jwtToken")');

    const url = 'https://server.lostengineering.com/email/send';
    const data = {
        accessToken: token,
        recipientEmail: recipient,
        subject: subject,
        content: content
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify(data)
    });
    const responseData = await response.json();
    if (response.ok) {
      console.log('Email sent successfully:', responseData);
      event.reply('email-send-success', 'Email sent successfully!');
      mainWindow.webContents.send('show-success-modal');
    } else {
      console.error('Failed to send email:', responseData.error);
      event.reply('email-send-failure', responseData.error);
      mainWindow.webContents.send('show-failure-modal');
    }
  } catch (error) {
      console.error('Error sending email:', error);
      event.reply('email-send-failure', error.message);
  }
});
