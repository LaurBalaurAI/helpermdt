const fs = require('fs');
const path = require('path');

class HealthCheck {
  constructor() {
    this.appPath = process.env.NODE_ENV === 'production' 
      ? path.dirname(process.execPath)
      : path.join(__dirname, '../../');
    this.versionPath = this.getVersionPath();
    this.healthFilePath = path.join(this.versionPath, 'health.ok');
  }

  getVersionPath() {
    if (process.env.NODE_ENV === 'production') {
      // In production, we're running from versions/<version>/app.exe
      const execPath = process.execPath;
      const versionDir = path.dirname(execPath);
      return versionDir;
    } else {
      // In development, use the project root
      return this.appPath;
    }
  }

  createHealthSignal() {
    try {
      // Ensure version directory exists
      if (!fs.existsSync(this.versionPath)) {
        fs.mkdirSync(this.versionPath, { recursive: true });
      }

      // Create health signal file
      fs.writeFileSync(this.healthFilePath, new Date().toISOString());
      console.log(`Health signal created at: ${this.healthFilePath}`);
      return true;
    } catch (error) {
      console.error(`Failed to create health signal: ${error.message}`);
      return false;
    }
  }

  removeHealthSignal() {
    try {
      if (fs.existsSync(this.healthFilePath)) {
        fs.unlinkSync(this.healthFilePath);
        console.log(`Health signal removed: ${this.healthFilePath}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to remove health signal: ${error.message}`);
      return false;
    }
  }

  checkHealthSignal() {
    try {
      return fs.existsSync(this.healthFilePath);
    } catch (error) {
      console.error(`Failed to check health signal: ${error.message}`);
      return false;
    }
  }
}

module.exports = HealthCheck;
