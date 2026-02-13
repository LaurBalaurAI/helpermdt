const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

class Launcher {
  constructor() {
    this.appPath = path.dirname(process.execPath);
    this.activeJsonPath = path.join(this.appPath, 'active.json');
    this.versionsPath = path.join(this.appPath, 'versions');
    this.logPath = path.join(this.appPath, 'launcher.log');
    this.healthTimeout = 10000; // 10 seconds
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
        this.log('active.json not found, creating default');
        const defaultConfig = {
          activeVersion: '0.0.1',
          previousVersion: null
        };
        fs.writeFileSync(this.activeJsonPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
      }
      
      const content = fs.readFileSync(this.activeJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.log(`Error reading active.json: ${error.message}`);
      return {
        activeVersion: '0.0.1',
        previousVersion: null
      };
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

  getVersionPath(version) {
    return path.join(this.versionsPath, version, 'app.exe');
  }

  getHealthFilePath(version) {
    return path.join(this.versionsPath, version, 'health.ok');
  }

  spawnVersion(version) {
    const versionPath = this.getVersionPath(version);
    
    if (!fs.existsSync(versionPath)) {
      this.log(`Version ${version} not found at ${versionPath}`);
      return null;
    }

    this.log(`Launching version ${version} from ${versionPath}`);
    
    const child = spawn(versionPath, [], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => {
      this.log(`Version ${version} stdout: ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      this.log(`Version ${version} stderr: ${data.toString().trim()}`);
    });

    child.on('error', (error) => {
      this.log(`Failed to spawn version ${version}: ${error.message}`);
    });

    child.on('exit', (code) => {
      this.log(`Version ${version} exited with code: ${code}`);
    });

    return child;
  }

  waitForHealthSignal(version, timeout = this.healthTimeout) {
    return new Promise((resolve) => {
      const healthPath = this.getHealthFilePath(version);
      let resolved = false;

      // Check if health file already exists
      if (fs.existsSync(healthPath)) {
        this.log(`Health file already exists for version ${version}`);
        resolve(true);
        return;
      }

      // Watch for health file creation
      const watcher = fs.watch(path.dirname(healthPath), (eventType, filename) => {
        if (filename === 'health.ok' && !resolved) {
          resolved = true;
          watcher.close();
          this.log(`Health signal received for version ${version}`);
          resolve(true);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          watcher.close();
          this.log(`Health check timeout for version ${version}`);
          resolve(false);
        }
      }, timeout);
    });
  }

  async performRollback(activeConfig) {
    if (!activeConfig.previousVersion) {
      this.log('No previous version available for rollback');
      return false;
    }

    this.log(`Performing rollback to version ${activeConfig.previousVersion}`);

    // Update active.json to point to previous version
    const rollbackConfig = {
      activeVersion: activeConfig.previousVersion,
      previousVersion: activeConfig.activeVersion
    };

    this.writeActiveJson(rollbackConfig);

    // Launch previous version
    const child = this.spawnVersion(activeConfig.previousVersion);
    if (!child) {
      this.log('Failed to launch previous version during rollback');
      return false;
    }

    // Wait for health signal from previous version
    const healthReceived = await this.waitForHealthSignal(activeConfig.previousVersion);
    if (healthReceived) {
      this.log('Rollback successful');
      return true;
    } else {
      this.log('Rollback failed - previous version also failed health check');
      return false;
    }
  }

  showErrorDialog(message) {
    const { spawn } = require('child_process');
    
    // Windows-specific error dialog
    if (os.platform() === 'win32') {
      spawn('powershell.exe', [
        '-Command',
        `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message}', 'Police Helper - Error', 'OK', 'Error')`
      ], { detached: true });
    } else {
      console.error('ERROR:', message);
    }
  }

  async start() {
    this.log('Launcher starting...');
    
    try {
      // Read active configuration
      const activeConfig = this.readActiveJson();
      this.log(`Active version: ${activeConfig.activeVersion}`);

      // Launch active version
      const child = this.spawnVersion(activeConfig.activeVersion);
      if (!child) {
        this.log('Failed to launch active version');
        await this.performRollback(activeConfig);
        return;
      }

      // Wait for health signal
      const healthReceived = await this.waitForHealthSignal(activeConfig.activeVersion);
      
      if (healthReceived) {
        this.log('Application started successfully');
        // Launcher can exit now
        setTimeout(() => {
          this.log('Launcher exiting');
          process.exit(0);
        }, 1000);
      } else {
        this.log('Health check failed, performing rollback');
        const rollbackSuccess = await this.performRollback(activeConfig);
        
        if (!rollbackSuccess) {
          const errorMsg = 'Both current and previous versions failed to start. Please reinstall the application.';
          this.log(errorMsg);
          this.showErrorDialog(errorMsg);
        }
      }

    } catch (error) {
      this.log(`Launcher error: ${error.message}`);
      this.showErrorDialog(`Launcher error: ${error.message}`);
    }
  }
}

// Start launcher
const launcher = new Launcher();
launcher.start();
