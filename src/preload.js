const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Basic controls
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (data, filename) => ipcRenderer.invoke('save-file', data, filename),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getResourcePath: (fileName) => ipcRenderer.invoke('get-resource-path', fileName),
  
  // Update controls
  triggerUpdate: (targetVersion, downloadUrl, sha256) => ipcRenderer.invoke('trigger-update', targetVersion, downloadUrl, sha256),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getReleaseHistory: () => ipcRenderer.invoke('get-release-history'),
  
  // Update events
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  
  // Remove all listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

console.log('Preload script loaded successfully');
