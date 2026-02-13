// Main entry point for Electron app
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Remove default frame for custom titlebar
    titleBarStyle: 'hidden', // Hide default titlebar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../resources/politia_logo.png'),
    show: false
  });

  // Load app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'index.html')}`
  );

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// IPC handlers for titlebar controls
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});

// File operations handlers
ipcMain.handle('get-downloads-path', async () => {
  const { app } = require('electron');
  return app.getPath('downloads');
});

ipcMain.handle('save-file', async (event, filePath, buffer) => {
  const fs = require('fs');
  try {
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

ipcMain.handle('ensure-directory', async (event, dirPath) => {
  const fs = require('fs');
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
});

ipcMain.on('open-file', (event, filePath) => {
  const { shell } = require('electron');
  shell.openPath(filePath);
});

ipcMain.handle('run-installer', async (event, filePath, args = []) => {
  const { spawn } = require('child_process');
  const path = require('path');
  
  return new Promise((resolve, reject) => {
    const installer = spawn(filePath, args, {
      detached: true,
      stdio: 'ignore'
    });
    
    installer.unref();
    
    // Dăm timp installer-ului să pornească
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
});

ipcMain.on('restart-app', () => {
  const { app } = require('electron');
  app.relaunch();
  app.exit();
});

ipcMain.on('shell-open-path', (event, filePath) => {
  const { shell } = require('electron');
  shell.openPath(filePath);
});

// Quit event handler
app.on('before-quit', (event) => {
  // Trimitem evenimentul către renderer process
  if (mainWindow) {
    mainWindow.webContents.send('app-quit');
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
