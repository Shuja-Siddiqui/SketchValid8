const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
let win;
const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 270,
    minHeight: 270,
    frame: false,
    // fullscreen: true, // Comment this in production
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      // devTools: false,
    },
  });
  win.loadFile('index.html');
  // win.webContents.openDevTools() // Comment this in production
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
