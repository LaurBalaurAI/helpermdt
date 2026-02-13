import axios from 'axios';

class UpdateService {
  constructor() {
    this.repoOwner = 'LaurBalaurAI';
    this.repoName = 'helpermdt';
    this.currentVersion = `v${require('../../package.json').version}`;
    this.progressCallback = null;
    this.installPath = 'C:\\Program Files\\Police Helper Enhanced';
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  _notifyProgress(progressData) {
    if (this.progressCallback) {
      this.progressCallback(progressData);
    }
  }

  getCurrentVersion() {
    // Try to get version from package.json
    try {
      const packageJson = require('../../package.json');
      return packageJson.version || '1.0.0';
    } catch (error) {
      console.warn('Could not read version from package.json:', error);
      return '1.0.0';
    }
  }

  async checkForUpdates() {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          },
          timeout: 5000
        }
      );

      const latestRelease = response.data;
      const latestVersion = latestRelease.tag_name.replace('v', '');
      
      return {
        hasUpdate: this.compareVersions(latestVersion, this.currentVersion) > 0,
        currentVersion: this.currentVersion,
        latestVersion: latestVersion,
        releaseNotes: latestRelease.body,
        downloadUrl: latestRelease.assets.find(asset => 
          asset.name.includes('Portable') && asset.name.endsWith('.exe')
        )?.browser_download_url,
        publishedAt: latestRelease.published_at,
        isPrerelease: latestRelease.prerelease,
        latestRelease: latestRelease
      };
    } catch (error) {
      console.warn('Could not check for updates:', error.message);
      
      // Return default state when no releases exist
      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        releaseNotes: 'No releases available yet.',
        downloadUrl: null,
        publishedAt: null,
        isPrerelease: false,
        error: error.message
      };
    }
  }

  async getReleasesHistory() {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          },
          timeout: 5000
        }
      );

      return response.data.map(release => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body,
        published_at: release.published_at,
        prerelease: release.prerelease,
        html_url: release.html_url,
        assets: release.assets
      }));
    } catch (error) {
      console.warn('Could not fetch releases history:', error.message);
      return [];
    }
  }

  async checkAdminPrivileges() {
    if (window.electronAPI) {
      try {
        const systemInfo = await window.electronAPI.getSystemInfo();
        // În Electron, vom verifica drepturile de administrator în main process
        return await window.electronAPI.checkAdminPrivileges();
      } catch (error) {
        console.warn('Could not check admin privileges:', error);
        return false;
      }
    }
    
    // În browser, returnăm false (nu putem instala)
    return false;
  }

  async downloadAndInstallUpdate(updateInfo) {
    try {
      // Verificăm drepturile de administrator
      const hasAdmin = await this.checkAdminPrivileges();
      if (!hasAdmin) {
        throw new Error('Aplicația trebuie să ruleze cu privilegii de administrator pentru a instala actualizări. Restart aplicația ca administrator.');
      }

      this._notifyProgress({ progress: 0, isDownloading: true, isInstalling: false });
      this.showToast('Se descarcă actualizarea...', 'info');
      
      // Descărcăm fișierul
      const response = await axios({
        method: 'GET',
        url: updateInfo.downloadUrl,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          this._notifyProgress({ 
            progress: percentCompleted, 
            isDownloading: true, 
            isInstalling: false 
          });
        }
      });

      this._notifyProgress({ progress: 100, isDownloading: false, isInstalling: true });
      this.showToast('Se instalează actualizarea...', 'info');

      // Trimitem fișierul către main process pentru instalare
      if (window.electronAPI) {
        const arrayBuffer = await response.data.arrayBuffer();
        const result = await window.electronAPI.installUpdate(arrayBuffer, updateInfo.fileName);
        
        if (result.success) {
          this.showToast('Actualizare instalată cu succes!', 'success');
          this._notifyProgress({ 
            progress: 100, 
            isDownloading: false, 
            isInstalling: false 
          });
          return { success: true };
        } else {
          throw new Error(result.error || 'Eroare la instalare');
        }
      } else {
        // Fallback pentru browser - doar download
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = updateInfo.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
        
        this.showToast('Actualizare descărcată! Trebuie să instalați manual.', 'success');
        return { success: true, manualInstall: true };
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      this.showToast(error.message, 'error');
      this._notifyProgress({ 
        progress: 0, 
        isDownloading: false, 
        isInstalling: false 
      });
      throw error;
    }
  }

  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  async downloadUpdate(downloadUrl) {
    try {
      this._notifyProgress({ progress: 0, isDownloading: true, isInstalling: false });

      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          this._notifyProgress({ 
            progress: percentCompleted, 
            isDownloading: true, 
            isInstalling: false 
          });
        }
      });

      this._notifyProgress({ progress: 100, isDownloading: false, isInstalling: false });
      return response.data;
    } catch (error) {
      console.error('Error downloading update:', error);
      this._notifyProgress({ progress: 0, isDownloading: false, isInstalling: false });
      throw new Error('Failed to download update.');
    }
  }

  formatReleaseNotes(releaseNotes) {
    if (!releaseNotes) return 'No release notes available.';
    
    // Convert markdown-like formatting to HTML
    return releaseNotes
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li>/g, '</li></ul>')
      .replace(/<\/ul><ul>/g, '');
  }

  async checkUpdatesOnStartup() {
    try {
      const updateInfo = await this.checkForUpdates();
      this._notifyProgress({ 
        updateAvailable: updateInfo.hasUpdate,
        updateInfo: updateInfo
      });
      return updateInfo;
    } catch (error) {
      // Silent fail for startup check - don't bother user
      console.log('Update check on startup completed');
      this._notifyProgress({ 
        updateAvailable: false,
        error: null
      });
    }
  }

  async installUpdate(silent = false) {
    // În browser nu putem instala direct, doar descărca
    this._notifyProgress({ isInstalling: true });
    
    try {
      // Simulare instalare - în realitate ar trebui să descarce fișierul
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this._notifyProgress({ isInstalling: false });
      return { success: true, filePath: 'update.exe' };
    } catch (error) {
      this._notifyProgress({ isInstalling: false });
      throw error;
    }
  }

  async installVersion(versionTag) {
    try {
      // Simulare instalare versiune specifică
      this._notifyProgress({ isInstalling: true });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this._notifyProgress({ isInstalling: false });
      return { success: true };
    } catch (error) {
      this._notifyProgress({ isInstalling: false });
      throw error;
    }
  }

  showToast(message, type = 'info') {
    // Afișăm toast notificare în centrul ferestrei
    try {
      // Creăm elementul toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'error' ? '#ff4444' : '#44aa44'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: fadeIn 0.3s ease-in;
      `;
      toast.textContent = message;
      
      // Adăugăm animația CSS dacă nu există
      if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(toast);
      
      // Eliminăm toast după 5 secunde
      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 5000);
      
    } catch (error) {
      console.error('Toast error:', error);
      // Fallback la console
      console.log(`Toast [${type}]: ${message}`);
    }
  }

  async downloadAndInstallUpdate(updateInfo) {
    try {
      this.showToast('Se descarcă actualizarea...', 'info');
      
      // Descărcăm fișierul
      const response = await axios({
        method: 'GET',
        url: updateInfo.downloadUrl,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          this._notifyProgress({ 
            progress: percentCompleted, 
            isDownloading: true, 
            isInstalling: false 
          });
        }
      });

      // Salvăm în localStorage pentru a ține minte de actualizare
      localStorage.setItem('pendingUpdate', JSON.stringify({
        version: updateInfo.latestVersion,
        downloadUrl: updateInfo.downloadUrl,
        fileName: `Police Helper v${updateInfo.latestVersion}.exe`,
        timestamp: Date.now()
      }));

      // Creăm blob pentru download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Creăm link pentru download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Police Helper v${updateInfo.latestVersion}.exe`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Curățăm URL object
      window.URL.revokeObjectURL(downloadUrl);
      
      this.showToast('Actualizare descărcată! Verificați folderul Downloads.', 'success');
      this._notifyProgress({ 
        progress: 100, 
        isDownloading: false, 
        isInstalling: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading update:', error);
      this.showToast('Eroare la descărcarea actualizării', 'error');
      this._notifyProgress({ 
        progress: 0, 
        isDownloading: false, 
        isInstalling: false 
      });
      throw error;
    }
  }

  checkForPendingUpdate() {
    try {
      const pendingUpdate = localStorage.getItem('pendingUpdate');
      if (pendingUpdate) {
        const update = JSON.parse(pendingUpdate);
        const hoursSinceDownload = (Date.now() - update.timestamp) / (1000 * 60 * 60);
        
        // Dacă au trecut mai mult de 24h, ștergem pending update
        if (hoursSinceDownload > 24) {
          localStorage.removeItem('pendingUpdate');
          return null;
        }
        
        return update;
      }
      return null;
    } catch (error) {
      console.warn('Error checking pending update:', error);
      return null;
    }
  }
}

export default UpdateService;
