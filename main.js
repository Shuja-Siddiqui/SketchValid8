const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
let win;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1024,
    height: 800,
    minWidth: 270,
    minHeight: 270,
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });
  win.webContents.openDevTools();
  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Listen for the 'close-window' message from the renderer process
ipcMain.on('close-window', () => {
  if (win) {
    win.close();
  }
});
ipcMain.on('toggle-fullscreen', () => {
  if (win) {
    win.setFullScreen(!win.isFullScreen());
  }
});
