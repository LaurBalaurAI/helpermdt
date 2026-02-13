const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const https = require('https');
const crypto = require('crypto');
const yauzl = require('yauzl');

class Updater {
  constructor() {
    this.appPath = path.dirname(process.execPath);
    this.activeJsonPath = path.join(this.appPath, 'active.json');
    this.versionsPath = path.join(this.appPath, 'versions');
    this.logPath = path.join(this.appPath, 'updater.log');
    this.downloadPath = path.join(this.appPath, 'temp');
    this.githubToken = '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';
    this.githubApi = 'https://api.github.com';
    this.repoOwner = 'LaurBalaurAI';
    this.repoName = 'helpermdt';
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logPath, logMessage);
    console.log(message);
  }

  readActiveJson() {
    try {
      if (!fs.existsSync(this.activeJsonPath)) {
        this.log('active.json not found');
        return null;
      }
      
      const content = fs.readFileSync(this.activeJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.log(`Error reading active.json: ${error.message}`);
      return null;
    }
  }

  writeActiveJson(config) {
    try {
      fs.writeFileSync(this.activeJsonPath, JSON.stringify(config, null, 2));
      this.log(`Updated active.json: ${JSON.stringify(config)}`);
    } catch (error) {
      this.log(`Error writing active.json: ${error.message}`);
    }
  }

  async fetchReleaseInfo(tagName) {
    return new Promise((resolve, reject) => {
      const url = `${this.githubApi}/repos/${this.repoOwner}/${this.repoName}/releases/tags/${tagName}`;
      
      const options = {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'PoliceHelper-Updater'
        }
      };

      https.get(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            resolve(release);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  async downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
      this.log(`Downloading from: ${url}`);
      
      const file = fs.createWriteStream(destination);
      
      const options = {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'PoliceHelper-Updater'
        }
      };

      https.get(url, options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed with status: ${res.statusCode}`));
          return;
        }

        const totalSize = parseInt(res.headers['content-length'], 10);
        let downloadedSize = 0;

        res.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = Math.round((downloadedSize / totalSize) * 100);
          this.log(`Download progress: ${progress}%`);
        });

        res.pipe(file);

        file.on('finish', () => {
          file.close();
          this.log('Download completed');
          resolve(destination);
        });

        file.on('error', reject);
      }).on('error', reject);
    });
  }

  calculateSHA256(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', reject);
    });
  }

  async verifySHA256(filePath, expectedHash) {
    this.log(`Verifying SHA256 for ${filePath}`);
    
    const actualHash = await this.calculateSHA256(filePath);
    this.log(`Expected: ${expectedHash}`);
    this.log(`Actual: ${actualHash}`);
    
    if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
      throw new Error('SHA256 verification failed');
    }
    
    this.log('SHA256 verification passed');
  }

  async extractZip(zipPath, extractPath) {
    return new Promise((resolve, reject) => {
      this.log(`Extracting ${zipPath} to ${extractPath}`);
      
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            zipfile.readEntry();
          } else {
            const absolutePath = path.join(extractPath, entry.fileName);
            
            // Ensure directory exists
            const directory = path.dirname(absolutePath);
            if (!fs.existsSync(directory)) {
              fs.mkdirSync(directory, { recursive: true });
            }

            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }

              readStream.pipe(fs.createWriteStream(absolutePath));
              readStream.on('end', () => {
                zipfile.readEntry();
              });
              readStream.on('error', reject);
            });
          }
        });

        zipfile.on('end', () => {
          this.log('Extraction completed');
          resolve();
        });

        zipfile.on('error', reject);
      });
    });
  }

  async downloadAndInstallVersion(targetVersion, downloadUrl, expectedSHA256) {
    try {
      this.log(`Starting download and install for version ${targetVersion}`);

      // Create temp directory
      if (!fs.existsSync(this.downloadPath)) {
        fs.mkdirSync(this.downloadPath, { recursive: true });
      }

      // Download the update package
      const fileName = `PoliceHelper-${targetVersion}.zip`;
      const downloadFilePath = path.join(this.downloadPath, fileName);
      
      await this.downloadFile(downloadUrl, downloadFilePath);

      // Verify SHA256
      if (expectedSHA256) {
        await this.verifySHA256(downloadFilePath, expectedSHA256);
      }

      // Create version directory
      const versionPath = path.join(this.versionsPath, targetVersion);
      if (!fs.existsSync(versionPath)) {
        fs.mkdirSync(versionPath, { recursive: true });
      }

      // Extract to version directory
      await this.extractZip(downloadFilePath, versionPath);

      // Find the app.exe in extracted files
      const appExePath = path.join(versionPath, 'app.exe');
      if (!fs.existsSync(appExePath)) {
        // Look for .exe files in subdirectories
        const exeFiles = this.findExeFiles(versionPath);
        if (exeFiles.length === 0) {
          throw new Error('No executable found in update package');
        }
        
        // Move the first .exe found to app.exe
        const sourceExe = exeFiles[0];
        fs.copyFileSync(sourceExe, appExePath);
        this.log(`Copied ${sourceExe} to ${appExePath}`);
      }

      // Clean up temp files
      fs.unlinkSync(downloadFilePath);

      this.log(`Version ${targetVersion} installed successfully`);
      return true;

    } catch (error) {
      this.log(`Error installing version ${targetVersion}: ${error.message}`);
      throw error;
    }
  }

  findExeFiles(dir) {
    const exeFiles = [];
    
    function scanDirectory(currentDir) {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.exe') && file !== 'PoliceUpdater.exe') {
          exeFiles.push(filePath);
        }
      }
    }
    
    scanDirectory(dir);
    return exeFiles;
  }

  async updateToVersion(targetVersion, downloadUrl, expectedSHA256) {
    try {
      this.log(`Starting update to version ${targetVersion}`);

      // Read current active configuration
      const activeConfig = this.readActiveJson();
      if (!activeConfig) {
        throw new Error('Could not read active configuration');
      }

      // Download and install new version
      await this.downloadAndInstallVersion(targetVersion, downloadUrl, expectedSHA256);

      // Update active.json
      const newConfig = {
        activeVersion: targetVersion,
        previousVersion: activeConfig.activeVersion
      };

      this.writeActiveJson(newConfig);

      // Launch the launcher elevated
      const launcherPath = path.join(this.appPath, 'PoliceHelperEnhanced.exe');
      this.log(`Launching elevated launcher: ${launcherPath}`);

      // Use runas to elevate
      exec(`runas /user:Administrator "${launcherPath}"`, (error, stdout, stderr) => {
        if (error) {
          this.log(`Elevation failed: ${error.message}`);
          return;
        }
        this.log('Elevated launcher launched');
      });

      // Exit updater
      setTimeout(() => {
        this.log('Updater exiting');
        process.exit(0);
      }, 2000);

    } catch (error) {
      this.log(`Update failed: ${error.message}`);
      throw error;
    }
  }

  async getLatestRelease() {
    try {
      const url = `${this.githubApi}/repos/${this.repoOwner}/${this.repoName}/releases/latest`;
      
      const options = {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'PoliceHelper-Updater'
        }
      };

      return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const release = JSON.parse(data);
              resolve(release);
            } catch (error) {
              reject(error);
            }
          });
        }).on('error', reject);
      });
    } catch (error) {
      this.log(`Error fetching latest release: ${error.message}`);
      throw error;
    }
  }

  async getReleaseHistory() {
    try {
      const url = `${this.githubApi}/repos/${this.repoOwner}/${this.repoName}/releases`;
      
      const options = {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'PoliceHelper-Updater'
        }
      };

      return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const releases = JSON.parse(data);
              resolve(releases);
            } catch (error) {
              reject(error);
            }
          });
        }).on('error', reject);
      });
    } catch (error) {
      this.log(`Error fetching release history: ${error.message}`);
      throw error;
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const updater = new Updater();

  if (args.length === 0) {
    console.log('Usage: PoliceUpdater.exe <command> [options]');
    console.log('Commands:');
    console.log('  update <version> <downloadUrl> [sha256]');
    console.log('  check-latest');
    console.log('  history');
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'update':
        if (args.length < 3) {
          console.log('Usage: PoliceUpdater.exe update <version> <downloadUrl> [sha256]');
          return;
        }
        
        const version = args[1];
        const downloadUrl = args[2];
        const sha256 = args[3] || null;
        
        await updater.updateToVersion(version, downloadUrl, sha256);
        break;

      case 'check-latest':
        const latest = await updater.getLatestRelease();
        console.log(JSON.stringify(latest, null, 2));
        break;

      case 'history':
        const history = await updater.getReleaseHistory();
        console.log(JSON.stringify(history, null, 2));
        break;

      default:
        console.log(`Unknown command: ${command}`);
    }
  } catch (error) {
    updater.log(`Command failed: ${error.message}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = Updater;
