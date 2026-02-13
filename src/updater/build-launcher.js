const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Build the launcher executable
function buildLauncher() {
  console.log('🔨 Building PoliceHelperEnhanced.exe (Launcher)...');
  
  const launcherPath = path.join(__dirname, 'Launcher.js');
  const outputPath = path.join(__dirname, '../../build/PoliceHelperEnhanced.exe');
  
  // Use pkg to create standalone executable
  const cmd = `npx pkg ${launcherPath} --target node18-win-x64 --output ${outputPath}`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build failed:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Build warnings:', stderr);
    }
    
    console.log('✅ Launcher built successfully!');
    console.log(`📍 Output: ${outputPath}`);
  });
}

// Build the updater executable
function buildUpdater() {
  console.log('🔨 Building PoliceUpdater.exe (Updater)...');
  
  const updaterPath = path.join(__dirname, 'Updater.js');
  const outputPath = path.join(__dirname, '../../build/PoliceUpdater.exe');
  
  // Use pkg to create standalone executable
  const cmd = `npx pkg ${updaterPath} --target node18-win-x64 --output ${outputPath}`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build failed:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Build warnings:', stderr);
    }
    
    console.log('✅ Updater built successfully!');
    console.log(`📍 Output: ${outputPath}`);
  });
}

// Build both executables
if (require.main === module) {
  buildLauncher();
  buildUpdater();
}

module.exports = { buildLauncher, buildUpdater };
