const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

class SmartPublisher {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(query) {
    return new Promise(resolve => {
      this.rl.question(query, resolve);
    });
  }

  async updatePackageVersion(newVersion) {
    console.log(`🔄 Actualizare versiune în package.json la ${newVersion}...`);
    
    const packageJsonPath = path.join(__dirname, 'package.json');
    let packageJson;
    
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    } catch (error) {
      console.error('❌ Eroare la citirea package.json:', error.message);
      throw error;
    }
    
    packageJson.version = newVersion;
    
    try {
      const newContent = JSON.stringify(packageJson, null, 2);
      fs.writeFileSync(packageJsonPath, newContent, 'utf8');
      console.log(`✅ Versiune actualizată la ${newVersion}`);
    } catch (error) {
      console.error('❌ Eroare la scrierea package.json:', error.message);
      throw error;
    }
  }

  async executeCommand(command, description) {
    return new Promise((resolve, reject) => {
      console.log(`🔄 ${description}...`);
      
      const child = exec(command, { 
        cwd: __dirname,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
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

  async updateActiveJson(newVersion) {
    console.log(`🔄 Actualizare active.json...`);
    
    const activeJsonPath = path.join(__dirname, 'active.json');
    let activeJson;
    
    try {
      const content = fs.readFileSync(activeJsonPath, 'utf8');
      activeJson = JSON.parse(content);
    } catch (error) {
      console.error('❌ Eroare la citirea active.json:', error.message);
      throw error;
    }
    
    // Păstrăm vechea versiune ca previousVersion
    activeJson.previousVersion = activeJson.activeVersion;
    activeJson.activeVersion = newVersion;
    
    try {
      const newContent = JSON.stringify(activeJson, null, 2);
      fs.writeFileSync(activeJsonPath, newContent, 'utf8');
      console.log(`✅ active.json actualizat: ${JSON.stringify(activeJson)}`);
    } catch (error) {
      console.error('❌ Eroare la scrierea active.json:', error.message);
      throw error;
    }
  }

  async createVersionFolder(newVersion) {
    console.log(`🔄 Creare director pentru versiunea ${newVersion}...`);
    
    const versionsDir = path.join(__dirname, 'versions');
    const versionDir = path.join(versionsDir, newVersion);
    
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
    }
    
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }
    
    // Copiem app.exe în folderul versiunii
    const sourceExe = path.join(__dirname, 'build', 'Police Helper Enhanced.exe');
    const targetExe = path.join(versionDir, 'app.exe');
    
    if (fs.existsSync(sourceExe)) {
      fs.copyFileSync(sourceExe, targetExe);
      console.log(`✅ app.exe copiat în versions/${newVersion}/`);
    } else {
      console.log(`⚠️ Police Helper Enhanced.exe nu a fost găsit în build/`);
    }
    
    return versionDir;
  }

  async publishToGitHub(newVersion) {
    console.log(`🔄 Publicare pe GitHub...`);
    
    try {
      // Adăugăm toate fișierele modificate
      await this.executeCommand('git add .', 'Adăugare fișiere modificate');
      
      // Commit cu versiunea nouă
      await this.executeCommand(
        `git commit -m "Release v${newVersion}"`,
        'Commit versiune nouă'
      );
      
      // Creăm tag-ul
      await this.executeCommand(
        `git tag v${newVersion}`,
        'Creare tag versiune'
      );
      
      // Setăm GitHub token pentru electron-builder (doar înainte de publicare)
      // Token-ul va fi setat manual în script-ul de publicare
      
      // Push la helpermdt (nu origin)
      await this.executeCommand('git push helpermdt main', 'Push la main');
      
      // Push tag-uri la helpermdt
      await this.executeCommand('git push helpermdt --tags', 'Push tag-uri');
      
      // Publicăm cu electron-builder
      await this.executeCommand('npm run publish-auto', 'Publicare pe GitHub releases');
      
      console.log(`✅ Versiunea ${newVersion} publicată pe GitHub`);
      
    } catch (error) {
      console.error(`❌ Eroare la publicarea pe GitHub:`, error.message);
      throw error;
    }
  }

  async buildApplication() {
    console.log(`🔄 Build aplicație...`);
    
    try {
      // Build React
      await this.executeCommand('npm run build-react', 'Build React');
      
      // Build Electron
      await this.executeCommand('npm run build-electron', 'Build Electron');
      
      // Build Updater
      await this.executeCommand('npm run build-updater', 'Build Updater');
      
      console.log(`✅ Build complet`);
      
    } catch (error) {
      console.error(`❌ Eroare la build:`, error.message);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🚀 Smart Publisher - Police Helper Enhanced');
      console.log('==========================================');
      
      // Afișăm versiunea curentă
      const currentVersion = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version;
      console.log(`📍 Versiune curentă: ${currentVersion}`);
      
      // Întrebăm pentru noua versiune
      const newVersion = await this.question('Ce versiune dorești să setezi? (ex: 0.1.0): ');
      
      if (!newVersion) {
        console.log('❌ Versiune invalidă');
        return;
      }
      
      // Confirmăm
      const confirm = await this.question(`Confirmi publicarea versiunii ${newVersion}? (y/N): `);
      
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('❌ Operațiune anulată');
        return;
      }
      
      console.log('\n🔄 Începem procesul de publicare...\n');
      
      // 1. Actualizăm versiunea în package.json
      await this.updatePackageVersion(newVersion);
      
      // 2. Actualizăm active.json
      await this.updateActiveJson(newVersion);
      
      // 3. Build aplicație
      await this.buildApplication();
      
      // 4. Creăm folder versiune
      await this.createVersionFolder(newVersion);
      
      // 5. Publicăm pe GitHub
      await this.publishToGitHub(newVersion);
      
      console.log('\n🎉 SUCCES! Publicare completă!');
      console.log(`✅ Versiunea ${newVersion} a fost publicată cu succes`);
      console.log('🔗 Verifică GitHub releases pentru descărcare');
      
    } catch (error) {
      console.error('\n❌ EROARE la publicare:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  // Metodă pentru publicare automată (fără confirmare)
  async runAuto(newVersion) {
    try {
      console.log('🚀 Smart Publisher - Police Helper Enhanced (AUTO)');
      console.log('==========================================');
      
      // Afișăm versiunea curentă
      const currentVersion = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version;
      console.log(`📍 Versiune curentă: ${currentVersion}`);
      console.log(`📍 Versiune nouă: ${newVersion}`);
      
      console.log('\n🔄 Începem procesul de publicare...\n');
      
      // 1. Actualizăm versiunea în package.json
      await this.updatePackageVersion(newVersion);
      
      // 2. Actualizăm active.json
      await this.updateActiveJson(newVersion);
      
      // 3. Build aplicație
      await this.buildApplication();
      
      // 4. Creăm folder versiune
      await this.createVersionFolder(newVersion);
      
      // 5. Publicăm pe GitHub
      await this.publishToGitHub(newVersion);
      
      console.log('\n🎉 SUCCES! Publicare completă!');
      console.log(`✅ Versiunea ${newVersion} a fost publicată cu succes`);
      console.log('🔗 Verifică GitHub releases pentru descărcare');
      
    } catch (error) {
      console.error('\n❌ EROARE la publicare:', error.message);
      process.exit(1);
    }
  }
}

// Rulăm script-ul
if (require.main === module) {
  const publisher = new SmartPublisher();
  publisher.run();
}

module.exports = SmartPublisher;
