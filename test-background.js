// Test script pentru verificarea background-ului în Electron
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let testWindow;

function createTestWindow() {
  testWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    }
  });

  // Load the built app
  testWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

  testWindow.webContents.openDevTools();

  testWindow.on('closed', () => {
    testWindow = null;
  });
}

// Add the same IPC handler for resource path
ipcMain.handle('get-resource-path', async (event, fileName) => {
  const resourcePath = path.join(__dirname, 'dist', 'win-unpacked', 'resources', 'resources', fileName);
  console.log('Resource path for', fileName, ':', resourcePath);
  return resourcePath;
});

app.whenReady().then(() => {
  createTestWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createTestWindow();
  }
});
