const { exec } = require('child_process');
const path = require('path');

// Setăm token-ul pentru publicare
process.env.GH_TOKEN = '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';

async function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    
    const child = exec(command, { 
      cwd: __dirname,
      maxBuffer: 1024 * 1024 * 10
    });
    
    child.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    child.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completat`);
        resolve();
      } else {
        console.error(`❌ ${description} eșuat cu codul ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Eroare la ${description}:`, error.message);
      reject(error);
    });
  });
}

async function publishManual() {
  try {
    console.log('🚀 Publicare Manuală - Police Helper Enhanced');
    console.log('==========================================');
    
    // Publicăm cu electron-builder
    await executeCommand('npm run publish-auto', 'Publicare pe GitHub releases');
    
    console.log('\n🎉 SUCCES! Publicare completă!');
    
  } catch (error) {
    console.error('\n❌ EROARE la publicare:', error.message);
    process.exit(1);
  }
}

// Rulăm funcția
if (require.main === module) {
  publishManual();
}

module.exports = { publishManual };
