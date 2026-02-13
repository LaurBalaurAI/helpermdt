// This file handles Electron API calls
// It's separated to avoid webpack compilation issues during development

const electronAPI = {
  // Window controls
  minimizeWindow: () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('minimize-window');
    }
  },
  
  maximizeWindow: () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('maximize-window');
    }
  },
  
  closeWindow: () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('close-window');
    }
  },

  quitApp: () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('quit-app');
    }
  },
  
  // Check if running in Electron
  isElectron: () => {
    return window.process && window.process.type;
  },

  // File operations
  saveFile: async (blob, fileName) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const { path } = window.require('path');
      const os = window.require('os');
      
      // Obținem directorul Downloads
      const downloadsPath = await ipcRenderer.invoke('get-downloads-path');
      const filePath = path.join(downloadsPath, fileName);
      
      // Convertim blob în buffer
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Salvăm fișierul
      const result = await ipcRenderer.invoke('save-file', filePath, buffer);
      return result;
    } else {
      throw new Error('Not running in Electron');
    }
  },

  saveFileToPath: async (blob, fileName, customPath) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const { path } = window.require('path');
      
      // Creăm directorul dacă nu există
      await ipcRenderer.invoke('ensure-directory', customPath);
      
      // Combinăm calea cu numele fișierului
      const filePath = path.join(customPath, fileName);
      
      // Convertim blob în buffer
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Salvăm fișierul
      const result = await ipcRenderer.invoke('save-file', filePath, buffer);
      return result;
    } else {
      throw new Error('Not running in Electron');
    }
  },

  openFile: (filePath) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('open-file', filePath);
    } else {
      // Fallback - deschidem cu shell
      window.open(`file://${filePath}`, '_blank');
    }
  },

  runInstaller: async (filePath, args = []) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      return await ipcRenderer.invoke('run-installer', filePath, args);
    } else {
      throw new Error('Not running in Electron');
    }
  },

  restartApp: () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('restart-app');
    }
  },

  // Quit event handlers
  onQuit: (callback) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.on('app-quit', callback);
    }
  },

  removeQuitListener: (callback) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.removeListener('app-quit', callback);
    }
  },

  // Shell operations
  shell: {
    openPath: (filePath) => {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('shell-open-path', filePath);
      } else {
        window.open(`file://${filePath}`, '_blank');
      }
    }
  }
};

export default electronAPI;
