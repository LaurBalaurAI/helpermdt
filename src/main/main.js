const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');
const axios = require('axios');

// Import HealthCheck for production
let HealthCheck;
if (process.env.NODE_ENV === 'production') {
  HealthCheck = require('./updater/HealthCheck');
}

// Suppress console warnings in development
if (process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('was preloaded using link preload but not used')) {
      return; // Suppress preload warnings
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Logging la pornire (după inițializarea app)
console.log('🚀 Police Helper Enhanced - Starting...');
console.log('🔍 Main: Platform:', process.platform);
console.log('🔍 Main: Arch:', process.arch);
console.log('🔍 Main: Electron version:', process.versions.electron);
console.log('🔍 Main: Node version:', process.versions.node);
console.log('🔍 Main: Exec path:', process.execPath);
console.log('🔍 Main: App path:', app.getAppPath());
console.log('🔍 Main: Resources path:', process.resourcesPath);
console.log('🔍 Main: User data:', app.getPath('userData'));
console.log('🔍 Main: NODE_ENV:', process.env.NODE_ENV);

// Configurare actualizări
process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  const { dialog } = require('electron');
  dialog.showErrorBox('Critical Error', `Uncaught Exception: ${error.message}\n\n${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  const { dialog } = require('electron');
  dialog.showErrorBox('Critical Error', `Unhandled Rejection: ${reason}`);
});

// Handler pentru erori de aplicație
app.on('render-process-gone', (event, webContents, details) => {
  console.error('🔥 Render process gone:', details);
  const { dialog } = require('electron');
  dialog.showErrorBox('Application Error', `Render process crashed: ${details.reason}`);
});

app.on('child-process-gone', (event, details) => {
  console.error('🔥 Child process gone:', details);
  const { dialog } = require('electron');
  dialog.showErrorBox('Application Error', `Child process crashed: ${details.reason}`);
});

// Removed update configuration
let mainWindow = null;
let tray = null;

function createWindow() {
  console.log('🔍 Main: Creating window with minimum size 927x700...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 927,
    minHeight: 700,
    frame: false, // Elimină titlebar-ul default
    titleBarStyle: 'hidden', // Ascunde titlebar-ul complet
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '..', 'preload.js')
    },
    icon: path.join(__dirname, '..', '..', 'resources', 'politia_icon.ico'),
    show: false,
    autoHideMenuBar: true
  });
  
  // Verificăm dacă dimensiunea minimă a fost setată corect
  console.log('🔍 Main: Window minimum size:', mainWindow.getMinimumSize());
  console.log('🔍 Main: Window initial size:', mainWindow.getSize());

  // Creare Tray Icon
  createTray();

  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '..', '..', 'build', 'index.html')}`;
  console.log('🔍 Main: Start URL:', startUrl);
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', async () => {
    mainWindow.show();
    
    console.log('🔍 Main: Window ready, application running');
    
    // Create health signal in production mode
    if (process.env.NODE_ENV === 'production' && HealthCheck) {
      try {
        const healthCheck = new HealthCheck();
        healthCheck.createHealthSignal();
        console.log('🔍 Main: Health signal created successfully');
      } catch (error) {
        console.error('🔥 Main: Failed to create health signal:', error);
      }
    }
    
    // Removed all update and admin logic
    console.log('🔍 Main: Update and admin functionality has been removed');
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (tray) {
      tray.destroy();
      tray = null;
    }
    
    // Remove health signal in production mode
    if (process.env.NODE_ENV === 'production' && HealthCheck) {
      try {
        const healthCheck = new HealthCheck();
        healthCheck.removeHealthSignal();
        console.log('🔍 Main: Health signal removed successfully');
      } catch (error) {
        console.error('🔥 Main: Failed to remove health signal:', error);
      }
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '..', '..', 'resources', 'politia_icon.ico');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Police Helper',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Minimize',
      click: () => {
        if (mainWindow) {
          mainWindow.minimize();
        }
      }
    },
    {
      label: 'Maximize',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
          } else {
            mainWindow.maximize();
          }
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Police Helper Enhanced');
  tray.setContextMenu(contextMenu);
  
  // Double click to show/hide window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// IPC Handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('quit-app', () => {
  app.quit();
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('save-file', async (event, data, filename) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename,
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled) {
    fs.writeFileSync(result.filePath, data);
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron
  };
});

ipcMain.handle('show-notification', async (event, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      icon: path.join(__dirname, '..', '..', 'resources', 'politia_icon.ico')
    });
    notification.show();
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('get-app-version', () => {
  return '1.0.0'; // Static version since update functionality is removed
});

// Update IPC Handlers
ipcMain.handle('trigger-update', async (event, targetVersion, downloadUrl, sha256) => {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    
    const updaterPath = path.join(process.env.NODE_ENV === 'production' 
      ? path.dirname(process.execPath) 
      : path.join(__dirname, '../..'), 
      'PoliceUpdater.exe');
    
    console.log('🔄 Triggering update with:', updaterPath, targetVersion);
    
    // Launch updater with parameters
    const updaterProcess = spawn(updaterPath, ['update', targetVersion, downloadUrl, sha256 || ''], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    updaterProcess.stdout.on('data', (data) => {
      console.log(`Updater stdout: ${data.toString().trim()}`);
    });
    
    updaterProcess.stderr.on('data', (data) => {
      console.log(`Updater stderr: ${data.toString().trim()}`);
    });
    
    updaterProcess.on('error', (error) => {
      console.error('Failed to start updater:', error);
      event.reply('update-error', error.message);
    });
    
    updaterProcess.on('exit', (code) => {
      console.log(`Updater exited with code: ${code}`);
      if (code === 0) {
        // Close main app to allow updater to work
        setTimeout(() => {
          if (mainWindow) {
            mainWindow.close();
          }
          app.quit();
        }, 2000);
      }
    });
    
    return { success: true, message: 'Update process started' };
    
  } catch (error) {
    console.error('Update trigger error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    
    const updaterPath = path.join(process.env.NODE_ENV === 'production' 
      ? path.dirname(process.execPath) 
      : path.join(__dirname, '../..'), 
      'PoliceUpdater.exe');
    
    return new Promise((resolve, reject) => {
      const updaterProcess = spawn(updaterPath, ['check-latest'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      
      updaterProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      updaterProcess.stderr.on('data', (data) => {
        console.error(`Updater stderr: ${data.toString().trim()}`);
      });
      
      updaterProcess.on('error', (error) => {
        reject(error);
      });
      
      updaterProcess.on('exit', (code) => {
        if (code === 0) {
          try {
            const releaseInfo = JSON.parse(output);
            resolve(releaseInfo);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Updater exited with code: ${code}`));
        }
      });
    });
    
  } catch (error) {
    console.error('Check updates error:', error);
    throw error;
  }
});

ipcMain.handle('get-release-history', async () => {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    
    const updaterPath = path.join(process.env.NODE_ENV === 'production' 
      ? path.dirname(process.execPath) 
      : path.join(__dirname, '../..'), 
      'PoliceUpdater.exe');
    
    return new Promise((resolve, reject) => {
      const updaterProcess = spawn(updaterPath, ['history'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      
      updaterProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      updaterProcess.stderr.on('data', (data) => {
        console.error(`Updater stderr: ${data.toString().trim()}`);
      });
      
      updaterProcess.on('error', (error) => {
        reject(error);
      });
      
      updaterProcess.on('exit', (code) => {
        if (code === 0) {
          try {
            const history = JSON.parse(output);
            resolve(history);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Updater exited with code: ${code}`));
        }
      });
    });
    
  } catch (error) {
    console.error('Get release history error:', error);
    throw error;
  }
});

ipcMain.handle('get-resource-path', async (event, fileName) => {
  // În development, folosim calea relativă
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..', '..', 'public', fileName);
  }
  // În production, folosim calea din build
  return path.join(__dirname, '..', '..', fileName);
});

// App events
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Update check interval is not defined anymore
});

// Security: previne navigarea externă
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
});





