import React, { useState, useEffect, useMemo } from 'react';
import '../styles/GlassTheme.css';
import '../styles/SettingsPage.css';
import DatabaseContext, { useDatabase } from '../contexts/DatabaseContext';
import WorkInProgress from '../components/WorkInProgress';

// Funcție pentru a aplica preview-ul temei (exportată pentru App.js)
export const applyThemePreview = (themeData) => {
  const root = document.documentElement;
  
  // Aplică culorile principale
  if (themeData.colors) {
    root.style.setProperty('--primary-color', themeData.colors.primary);
    root.style.setProperty('--secondary-color', themeData.colors.secondary);
    root.style.setProperty('--accent-color', themeData.colors.accent);
    
    // Setează valorile RGB pentru hover states
    const primaryRgb = hexToRgb(themeData.colors.primary);
    const secondaryRgb = hexToRgb(themeData.colors.secondary);
    const accentRgb = hexToRgb(themeData.colors.accent);
    
    if (primaryRgb) {
      root.style.setProperty('--primary-color-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    }
    if (secondaryRgb) {
      root.style.setProperty('--secondary-color-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    }
    if (accentRgb) {
      root.style.setProperty('--accent-color-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    }
  }
  
  // Aplică fundalurile
  if (themeData.backgrounds) {
    Object.entries(themeData.backgrounds).forEach(([key, value]) => {
      const r = parseInt(value.color.slice(1, 3), 16);
      const g = parseInt(value.color.slice(3, 5), 16);
      const b = parseInt(value.color.slice(5, 7), 16);
      const rgbaColor = `rgba(${r}, ${g}, ${b}, ${value.opacity})`;
      
      root.style.setProperty(`--bg-${key}-color`, rgbaColor);
      root.style.setProperty(`--bg-${key}-opacity`, value.opacity);
      
      // Aplică blur pentru toate elementele dacă există
      if (value.blur !== undefined) {
        root.style.setProperty(`--bg-${key}-blur`, `${value.blur}px`);
      }
    });
  }
  
  // Aplică textele
  if (themeData.texts) {
    Object.entries(themeData.texts).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}-family`, value.family);
      root.style.setProperty(`--text-${key}-size`, value.size);
      root.style.setProperty(`--text-${key}-color`, value.color);
    });
  }
  
  // Aplică iconițele
  if (themeData.icons) {
    Object.entries(themeData.icons).forEach(([key, value]) => {
      const r = parseInt(value.color.slice(1, 3), 16);
      const g = parseInt(value.color.slice(3, 5), 16);
      const b = parseInt(value.color.slice(5, 7), 16);
      const rgbaColor = `rgba(${r}, ${g}, ${b}, ${value.opacity})`;
      
      root.style.setProperty(`--icon-${key}-color`, rgbaColor);
      root.style.setProperty(`--icon-${key}-opacity`, value.opacity);
    });
  }
  
  // Aplică bordurile
  if (themeData.borders) {
    root.style.setProperty('--border-width', themeData.borders.width);
    
    // Convertim HEX în RGBA folosind opacitatea
    const r = parseInt(themeData.borders.color.slice(1, 3), 16);
    const g = parseInt(themeData.borders.color.slice(3, 5), 16);
    const b = parseInt(themeData.borders.color.slice(5, 7), 16);
    const opacity = themeData.borders.opacity !== undefined ? themeData.borders.opacity : 1;
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    
    root.style.setProperty('--border-color', rgbaColor);
    root.style.setProperty('--border-radius', themeData.borders.radius);
  }
  
  // Aplică modal backdrop
  if (themeData.modalBackdrop) {
    const r = parseInt(themeData.modalBackdrop.color.slice(1, 3), 16);
    const g = parseInt(themeData.modalBackdrop.color.slice(3, 5), 16);
    const b = parseInt(themeData.modalBackdrop.color.slice(5, 7), 16);
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${themeData.modalBackdrop.opacity})`;
    
    root.style.setProperty('--modal-backdrop-color', rgbaColor);
    root.style.setProperty('--modal-backdrop-blur', `${themeData.modalBackdrop.blur}px`);
  }
  
  // Aplică modal window
  if (themeData.modalWindow) {
    const r = parseInt(themeData.modalWindow.backgroundColor.slice(1, 3), 16);
    const g = parseInt(themeData.modalWindow.backgroundColor.slice(3, 5), 16);
    const b = parseInt(themeData.modalWindow.backgroundColor.slice(5, 7), 16);
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${themeData.modalWindow.backgroundOpacity})`;
    
    root.style.setProperty('--modal-window-background', rgbaColor);
    root.style.setProperty('--modal-window-blur', `${themeData.modalWindow.blur || 0}px`);
    
    // Aplică fundal carduri în modal
    const cardR = parseInt(themeData.modalWindow.cardsBackgroundColor.slice(1, 3), 16);
    const cardG = parseInt(themeData.modalWindow.cardsBackgroundColor.slice(3, 5), 16);
    const cardB = parseInt(themeData.modalWindow.cardsBackgroundColor.slice(5, 7), 16);
    const cardRgbaColor = `rgba(${cardR}, ${cardG}, ${cardB}, ${themeData.modalWindow.cardsBackgroundOpacity})`;
    
    root.style.setProperty('--modal-cards-background', cardRgbaColor);
    
    // Aplică fundal butoane
    const btnR = parseInt(themeData.modalWindow.buttonBackgroundColor.slice(1, 3), 16);
    const btnG = parseInt(themeData.modalWindow.buttonBackgroundColor.slice(3, 5), 16);
    const btnB = parseInt(themeData.modalWindow.buttonBackgroundColor.slice(5, 7), 16);
    const btnRgbaColor = `rgba(${btnR}, ${btnG}, ${btnB}, ${themeData.modalWindow.buttonBackgroundOpacity})`;
    
    root.style.setProperty('--button-background', btnRgbaColor);
    root.style.setProperty('--button-size', `${themeData.modalWindow.buttonSize}px`);
  }
  
  // Aplică scrollbar
  if (themeData.backgrounds && themeData.backgrounds.app && themeData.backgrounds.app.color) {
    const r = parseInt(themeData.backgrounds.app.color.slice(1, 3), 16);
    const g = parseInt(themeData.backgrounds.app.color.slice(3, 5), 16);
    const b = parseInt(themeData.backgrounds.app.color.slice(5, 7), 16);
    const btnRgbaColor = `rgba(${r}, ${g}, ${b}, ${themeData.modalWindow ? themeData.modalWindow.buttonBackgroundOpacity : 0.3})`;
    
    root.style.setProperty('--scrollbar-thumb', btnRgbaColor);
  }
};

// Funcție helper pentru a converti HEX în RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const SettingsPage = ({ policeLightsEnabled = false, setPoliceLightsEnabled = () => {} }) => {
  const { databaseData, isLoading, filterCodPenal: globalFilterCodPenal, filterVehicule: globalFilterVehicule, filterLimiteViteza: globalFilterLimiteViteza, updateDatabaseData, setDatabaseData, lastSync, syncWithGitHub, loadLocalData } = useDatabase();
  const [activeTab, setActiveTab] = useState('interface');
  const [showThemesModal, setShowThemesModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  // State pentru modalele de liste
  const [showCodPenalModal, setShowCodPenalModal] = useState(false);
  const [showVehiculeModal, setShowVehiculeModal] = useState(false);
  const [showLimiteVitezaModal, setShowLimiteVitezaModal] = useState(false);
  
  // State pentru editare
  const [editingModal, setEditingModal] = useState(null); // 'codPenal', 'vehicule', 'limiteViteza'
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // Copie editabilă a item-ului selectat
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false); // Pentru adăugare intrări noi
  const [isDeleting, setIsDeleting] = useState(false); // Pentru ștergere intrări
  
  // State pentru notificări toast
  const [toast, setToast] = useState({
    show: false,
    type: 'success', // 'success', 'error', 'info'
    message: ''
  });

  // State pentru căutare în baza de date
  const [searchTerms, setSearchTerms] = useState({
    codPenal: '',
    vehicule: '',
    limiteViteza: ''
  });

  // State pentru popup detalii
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [detailType, setDetailType] = useState(''); // 'codPenal', 'vehicule', 'limiteViteza'

  // Funcție pentru normalizare text (fără diacritice)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Elimină diacriticele
  };

  // Funcții de filtrare pentru fiecare secțiune (folosim funcțiile globale)
  const filterCodPenal = (items) => {
    if (!searchTerms.codPenal) return items;
    return globalFilterCodPenal(searchTerms.codPenal);
  };

  const filterVehicule = (items) => {
    if (!searchTerms.vehicule) return items;
    return globalFilterVehicule(searchTerms.vehicule);
  };

  const filterLimiteViteza = (items) => {
    if (!searchTerms.limiteViteza) return items;
    return globalFilterLimiteViteza(searchTerms.limiteViteza);
  };
  
  const [templates, setTemplates] = useState({
    introAutoconstatare: '',
    introApel112: '',
    introFocuriArma: '',
    introJaf: '',
    introFurtAuto: '',
    introActiuneRutiera: '',
    introActiuneControl: '',
    introRazieSAS: '',
    sanctiuni: '',
    structuraGenerala: ''
  });

  // Funcție pentru a salva șabloanele local
  const saveTemplates = (templateData) => {
    try {
      localStorage.setItem('policeHelper_templates', JSON.stringify(templateData));
      console.log('Șabloane salvate local');
    } catch (error) {
      console.error('Eroare la salvarea șabloanelor:', error);
    }
  };

  // Funcție pentru a încărca șabloanele locale
  const loadTemplates = () => {
    try {
      const localTemplates = localStorage.getItem('policeHelper_templates');
      if (localTemplates) {
        return JSON.parse(localTemplates);
      }
    } catch (error) {
      console.error('Eroare la încărcarea șabloanelor locale:', error);
    }
    return null;
  };

  // Funcție pentru a mapa șabloanele din baza de date în state-ul local
  const mapTemplatesFromDatabase = (data) => {
    console.log('=== DEBUG MAPARE ȘABLOANE ===');
    console.log('Date primite:', data);
    console.log('aiLogic există?', !!data.aiLogic);
    console.log('aiSettings există?', !!data.aiSettings);
    console.log('templates există?', !!data.templates);
    console.log('Toate cheile din data:', Object.keys(data));
    
    if (data.aiLogic) {
      console.log('aiLogic content:', JSON.stringify(data.aiLogic, null, 2));
      console.log('Chei în aiLogic:', Object.keys(data.aiLogic));
    }
    if (data.aiSettings) {
      console.log('aiSettings content:', JSON.stringify(data.aiSettings, null, 2));
      console.log('Chei în aiSettings:', Object.keys(data.aiSettings));
    }
    if (data.templates) {
      console.log('templates content:', JSON.stringify(data.templates, null, 2));
      console.log('Chei în templates:', Object.keys(data.templates));
    }
    
    const mappedTemplates = {
      introAutoconstatare: data.aiLogic?.intro_autoconstatare || '',
      introApel112: data.aiLogic?.intro_apel_112 || '',
      introFocuriArma: data.aiLogic?.intro_sri || '',
      introJaf: data.aiLogic?.intro_jaf || '',
      introFurtAuto: data.aiLogic?.intro_furt_auto || '',
      introActiuneRutiera: data.aiLogic?.intro_rutiera || '',
      introActiuneControl: data.aiLogic?.intro_mineriada || '',
      introRazieSAS: data.aiLogic?.intro_razie_sas || '',
      sanctiuni: data.aiLogic?.sanctions || '',
      structuraGenerala: data.aiSettings?.masterTemplate || ''
    };
    
    console.log('Șabloane mapate:', mappedTemplates);
    console.log('structuraGenerala value:', mappedTemplates.structuraGenerala);
    console.log('=== SFÂRȘIT DEBUG MAPARE ===');
    
    setTemplates(mappedTemplates);
    saveTemplates(mappedTemplates);
  };
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditTheme, setCurrentEditTheme] = useState(null); // Pentru editare în timp real
  const [themes, setThemes] = useState([]); // Teme gestionate cu state
  const [autoSync, setAutoSync] = useState(false); // Starea pentru sincronizare automată
  
  // State pentru actualizări
  const [currentVersion, setCurrentVersion] = useState('0.0.9');
  const [latestRelease, setLatestRelease] = useState(null);
  const [releaseHistory, setReleaseHistory] = useState([]);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateError, setUpdateError] = useState('');
  const [lastCheckTime, setLastCheckTime] = useState('Niciodată');

  // Salvăm starea autoSync la fiecare schimbare
  useEffect(() => {
    localStorage.setItem('autoSync', autoSync.toString());
  }, [autoSync]);

  // Verifică actualizări
  const checkForUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateError('');
    
    try {
      // Verificăm dacă electronAPI este disponibil
      if (!window.electronAPI) {
        throw new Error('Electron API nu este disponibil');
      }
      
      // Verificăm dacă funcțiile de update sunt disponibile
      if (typeof window.electronAPI.checkForUpdates !== 'function') {
        throw new Error('Funcțiile de update nu sunt disponibile');
      }
      
      // Use new updater system
      const releaseInfo = await window.electronAPI.checkForUpdates();
      
      setLatestRelease(releaseInfo);
      setLastCheckTime(new Date().toLocaleString('ro-RO'));
      
      // Also get release history
      const history = await window.electronAPI.getReleaseHistory();
      setReleaseHistory(history);
      
    } catch (err) {
      console.error('❌ Eroare la verificare actualizări:', err);
      setUpdateError('Nu s-a putut verifica actualizările: ' + err.message);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Descarcă ultima versiune
  const downloadLatestVersion = async () => {
    if (!latestRelease) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setUpdateError('');
    
    try {
      // Find the .exe asset
      const exeAsset = latestRelease.assets.find(asset => 
        asset.name.endsWith('.exe') && !asset.name.includes('blockmap')
      );
      
      if (!exeAsset) {
        throw new Error('Nu s-a găsit fișierul de instalare');
      }
      
      // Simulate progress
      for (let i = 0; i <= 50; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setDownloadProgress(i);
      }
      
      // Trigger update through new system
      const result = await window.electronAPI.triggerUpdate(
        latestRelease.tag_name,
        exeAsset.browser_download_url,
        exeAsset.sha256 || null
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Eroare la pornirea actualizării');
      }
      
      // Continue progress simulation
      for (let i = 55; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setDownloadProgress(i);
      }
      
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
      
    } catch (err) {
      setUpdateError('Eroare la descărcare: ' + err.message);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Descarcă un release specific
  const downloadRelease = async (release) => {
    try {
      // Find the .exe asset
      const exeAsset = release.assets.find(asset => 
        asset.name.endsWith('.exe') && !asset.name.includes('blockmap')
      );
      
      if (!exeAsset) {
        throw new Error('Nu s-a găsit fișierul de instalare');
      }
      
      // Trigger update for specific version
      const result = await window.electronAPI.triggerUpdate(
        release.tag_name,
        exeAsset.browser_download_url,
        exeAsset.sha256 || null
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Eroare la pornirea actualizării');
      }
      
    } catch (err) {
      setUpdateError('Eroare la descărcare: ' + err.message);
    }
  };

  // Formatează data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatează release notes
  const formatReleaseNotes = (notes) => {
    if (!notes) return 'Nu există note de lansare disponibile.';
    
    // Limitează la 500 caractere
    const truncated = notes.length > 500 ? notes.substring(0, 500) + '...' : notes;
    
    // Convertește line breaks în <br>
    return truncated.split('\n').map((line, index) => (
      <p key={index}>{line || <br />}</p>
    ));
  };

  // Verifică dacă există actualizare
  const hasUpdate = latestRelease && latestRelease.tag_name !== `v${currentVersion}`;
  
  // State pentru modulele de sincronizare
  const [syncModules, setSyncModules] = useState([
    { id: 'codPenal', name: 'Cod Penal', enabled: true },
    { id: 'vehicule', name: 'Vehicule', enabled: true },
    { id: 'limiteViteza', name: 'Limite Viteză', enabled: true },
    { id: 'aiLogic', name: 'AI Logic', enabled: true },
    { id: 'aiSettings', name: 'AI Settings', enabled: true },
    { id: 'radioSettings', name: 'Radio Settings', enabled: true },
    { id: 'policeOverlaySettings', name: 'Police Overlay Settings', enabled: true },
    { id: 'hotkeys', name: 'Hotkeys', enabled: true }
  ]);

  // Funcții pentru gestionarea editării
  const startEditing = (modalType) => {
    setEditingModal(modalType);
    setSelectedItem(null);
    setEditingItem(null);
  };

  const selectItemForEdit = (item, modalType) => {
    setSelectedItem(item);
    setEditingItem({ ...item }); // Creăm o copie editabilă
    setEditingModal(null);
  };

  const cancelEditing = () => {
    setEditingModal(null);
    setSelectedItem(null);
    setEditingItem(null);
    setIsAddingNew(false);
    setIsDeleting(false);
    showToast('error', '✕ Anulat');
  };

  // Funcție pentru afișare toast
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  // Funcții pentru ștergere
  const startDeleting = () => {
    setIsDeleting(true);
    setEditingModal(null);
    showToast('info', '🗑️ Selectează un element de șters');
  };

  // Funcție pentru a afișa detaliile unui item
  const showItemDetails = (item, type) => {
    setDetailItem(item);
    setDetailType(type);
    setShowDetailPopup(true);
  };

  // Funcție pentru a închide popup-ul de detalii
  const closeDetailPopup = () => {
    setShowDetailPopup(false);
    setDetailItem(null);
    setDetailType('');
  };

  const deleteItem = (item, modalType) => {
    if (!isDeleting) return;
    
    const updatedData = { ...databaseData };
    
    if (modalType === 'codPenal') {
      updatedData.codPenal = updatedData.codPenal.filter(articol => articol.id !== item.id);
    } else if (modalType === 'vehicule') {
      updatedData.vehicule = updatedData.vehicule.filter(vehicul => vehicul.id !== item.id);
    } else if (modalType === 'limiteViteza') {
      updatedData.limiteViteza = updatedData.limiteViteza.filter(limita => limita.id !== item.id);
    }
    
    updateDatabaseData(updatedData);
    
    setIsDeleting(false);
    showToast('success', '✓ Element șters cu succes');
  };

  // Funcții pentru adăugare intrări noi
  const startAddingNew = (modalType) => {
    setIsAddingNew(true);
    setEditingModal(null);
    setSelectedItem(null);
    
    // Creăm un item nou gol în funcție de tip
    let newItem = {};
    if (modalType === 'codPenal') {
      newItem = {
        id: `articol_nou_${Date.now()}`,
        cap: '',
        numarArticol: '',
        titlu: '',
        definitie: '',
        amendaMin: '',
        amendaMax: '',
        aresteMin: '',
        aresteMax: '',
        punctePermis: '',
        anularePermis: false,
        perchezitie: false,
        ridicareVehicul: false,
        dosarPenal: false,
        arestePeViata: false
      };
    } else if (modalType === 'vehicule') {
      newItem = {
        id: `vehicul_nou_${Date.now()}`,
        marca: '',
        model: '',
        categorie: '',
        anFabricatie: '',
        putere: '',
        capacitateCilindrica: '',
        taraOrigine: '',
        normeEuro: ''
      };
    } else if (modalType === 'limiteViteza') {
      newItem = {
        id: `limita_noua_${Date.now()}`,
        tipZona: '',
        limitaMaxima: '',
        limitaMinima: '',
        tipVehicul: '',
        conditiiSpeciale: '',
        sanctiuni: ''
      };
    }
    
    setEditingItem(newItem);
  };

  const saveNewItem = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    
    // Adăugăm item-ul nou în datele locale
    const updatedData = { ...databaseData };
    
    // Determinăm tipul de date în funcție de structura item-ului
    if (editingItem.cap !== undefined) {
      // E un articol din codul penal
      updatedData.codPenal = [...(updatedData.codPenal || []), editingItem];
    } else if (editingItem.marca !== undefined) {
      // E un vehicul
      updatedData.vehicule = [...(updatedData.vehicule || []), editingItem];
    } else if (editingItem.tipZona !== undefined) {
      // E o limită de viteză
      updatedData.limiteViteza = [...(updatedData.limiteViteza || []), editingItem];
    }
    
    updateDatabaseData(updatedData);
    
    setIsSaving(false);
    setSaveSuccess(true);
    setIsAddingNew(false);
    setEditingItem(null);
    
    showToast('success', '✓ Element adăugat cu succes');
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const saveChanges = async () => {
    if (!editingItem || !selectedItem) return;
    setIsSaving(true);
    
    // Momentual doar actualizăm state-ul local
    const updatedData = { ...databaseData };
    
    if (selectedItem.id?.includes('cap.')) {
      // E un articol din codul penal
      const index = updatedData.codPenal.findIndex(item => item.id === selectedItem.id);
      if (index !== -1) {
        updatedData.codPenal[index] = editingItem;
      }
    } else if (selectedItem.id?.includes('_autoturism') || selectedItem.id?.includes('service') || selectedItem.id?.includes('maii')) {
      // E un vehicul
      const index = updatedData.vehicule.findIndex(item => item.id === selectedItem.id);
      if (index !== -1) {
        updatedData.vehicule[index] = editingItem;
      }
    } else {
      // E o limită de viteză
      const index = updatedData.limiteViteza.findIndex(item => item.id === selectedItem.id);
      if (index !== -1) {
        updatedData.limiteViteza[index] = editingItem;
      }
    }
    
    updateDatabaseData(updatedData);
    setSelectedItem(editingItem);
    
    // Aici ar trebui să trimitem modificările la server
    console.log('Modificări salvate:', editingItem);
    
    // Feedback vizual de succes
    setSaveSuccess(true);
    showToast('success', '✓ Modificări salvate cu succes');
    setTimeout(() => setSaveSuccess(false), 2000);
    
    setIsSaving(false);
  };

  const updateEditingItem = (field, value) => {
    setEditingItem(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Sincronizare amenda min/max
      if (field === 'amendaMin') {
        updated.amendaMax = value;
      } else if (field === 'amendaMax') {
        updated.amendaMin = value;
      }
      
      // Sincronizare arest min/max
      if (field === 'aresteMin') {
        updated.aresteMax = value;
      } else if (field === 'aresteMax') {
        updated.aresteMin = value;
      }
      
      return updated;
    });
  };

  // Funcție pentru actualizarea șabloanelor
  const updateTemplate = (field, value) => {
    const newTemplates = {
      ...templates,
      [field]: value
    };
    setTemplates(newTemplates);
    saveTemplates(newTemplates); // Salvăm automat modificările
  };

  // Încărcăm datele din database.json la montarea componentei
  useEffect(() => {
    const loadData = async () => {
      // Încărcăm starea autoSync salvată
      const savedAutoSync = localStorage.getItem('autoSync') === 'true';
      setAutoSync(savedAutoSync);
      
      // Doar facem sincronizare dacă e bifat autoSync
      if (savedAutoSync) {
        const syncSuccess = await syncWithGitHub(false);
        
        // Dacă sincronizarea a reușit, mapăm șabloanele din datele noi
        if (syncSuccess && databaseData) {
          mapTemplatesFromDatabase(databaseData);
        }
        
        // Dacă sincronizarea eșuează, încărcăm datele locale
        if (!syncSuccess) {
          const localData = loadLocalData();
          if (localData) {
            setDatabaseData(localData);
            // Mapăm șabloanele din datele locale
            mapTemplatesFromDatabase(localData);
            console.log('Încărcate date locale ca fallback');
          } else {
            console.log('Nu există date locale disponibile');
            // Încărcăm șabloanele locale dacă există
            const localTemplates = loadTemplates();
            if (localTemplates) {
              setTemplates(localTemplates);
              console.log('Șabloane încărcate din localStorage');
            }
          }
        }
      } else {
        // Dacă nu e bifat autoSync, încărcăm doar datele locale
        const localData = loadLocalData();
        if (localData) {
          setDatabaseData(localData);
          mapTemplatesFromDatabase(localData);
          console.log('Încărcate date locale (autoSync dezactivat)');
        } else {
          // Încărcăm șabloanele locale dacă există
          const localTemplates = loadTemplates();
          if (localTemplates) {
            setTemplates(localTemplates);
            console.log('Șabloane încărcate din localStorage');
          }
        }
      }
    };
    
    loadData();
  }, []); // Rulat doar la montare

  // Reacționăm la schimbările din databaseData pentru a mapa șabloanele
  useEffect(() => {
    console.log('=== USEEFFECT DATABASEDATA SCHIMBAT ===');
    console.log('databaseData:', databaseData);
    console.log('aiLogic există?', !!databaseData?.aiLogic);
    console.log('aiSettings există?', !!databaseData?.aiSettings);
    console.log('templates există?', !!databaseData?.templates);
    console.log('Toate cheile:', Object.keys(databaseData || {}));
    
    if (databaseData && (databaseData.aiLogic || databaseData.aiSettings)) {
      console.log('Apelăm mapTemplatesFromDatabase...');
      mapTemplatesFromDatabase(databaseData);
    } else {
      console.log('Nu mapăm - lipsesc datele necesare');
    }
    console.log('=== SFÂRȘIT USEEFFECT DATABASEDATA ===');
  }, [databaseData]);

  // Separat, gestionăm intervalul de sincronizare automată
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (autoSync) {
        syncWithGitHub(false); // fără feedback la sincronizarea automată
      }
    }, 30 * 60 * 1000); // 30 minute în milisecunde
    
    return () => clearInterval(syncInterval); // curățăm interval-ul la unmount
  }, [autoSync]);

  // Salvăm starea autoSync la fiecare schimbare
  useEffect(() => {
    localStorage.setItem('autoSync', autoSync.toString());
  }, [autoSync]);

  const tabs = [
    { id: 'interface', label: 'Setări interfață' },
    { id: 'database', label: 'Bază de Date' },
    { id: 'updates', label: 'Actualizări' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'interface':
        return (
          <div className="tab-content">
            <div className="glass-section">
              <h3>Aspect</h3>
              <div className="aspect-buttons">
                <button className="glass-button" onClick={() => setShowThemesModal(true)}>
                  Teme
                </button>
                <label className="glass-button" style={{ marginLeft: '1rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={policeLightsEnabled}
                    onChange={(e) => setPoliceLightsEnabled(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  {policeLightsEnabled ? 'Oprește Police Lights' : 'Activează Police Lights'}
                </label>
              </div>
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="tab-content">
            <div className="glass-section database-sync-buttons">
              <button className="glass-button" onClick={() => setShowSyncModal(true)}>Setări sincronizare</button>
              <button className="glass-button glow-hover" onClick={async () => {
                console.log('=== BUTON SINCRONIZARE MANUALĂ APĂSAT ===');
                const syncSuccess = await syncWithGitHub(true);
                console.log('syncSuccess:', syncSuccess);
                console.log('databaseData după sync:', databaseData);
                
                // Dacă sincronizarea a reușit, mapăm șabloanele din datele noi
                if (syncSuccess && databaseData) {
                  console.log('Mapăm șabloanele după sincronizare manuală...');
                  mapTemplatesFromDatabase(databaseData);
                } else {
                  console.log('Sincronizare eșuată sau fără date');
                }
                console.log('=== SFÂRȘIT SINCRONIZARE MANUALĂ ===');
              }}>Sincronizează acum</button>
            </div>
            <div className="database-layout">
              {/* Coloana stângă - 3 carduri */}
              <div className="database-left-column">
                <div className="glass-section">
                  <div className="section-header">
                    <h3>Cod Penal</h3>
                    <button className="glass-button view-all-button" onClick={() => setShowCodPenalModal(true)}>
                      Editează
                    </button>
                  </div>
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <input 
                        type="text"
                        className="search-input"
                        placeholder="Caută în Cod Penal..."
                        value={searchTerms.codPenal}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, codPenal: e.target.value }))}
                      />
                      {searchTerms.codPenal && (
                        <button 
                          className="search-clear-button"
                          onClick={() => setSearchTerms(prev => ({ ...prev, codPenal: '' }))}
                          title="Golește căutarea"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="database-grid">
                    {filterCodPenal(databaseData.codPenal || []).map((articol, index) => (
                      <div 
                        key={articol.id} 
                        className="database-item"
                        onClick={() => showItemDetails(articol, 'codPenal')}
                      >
                        <div className="database-item-header">
                          <span className="database-item-title">{articol.cap} - Art. {articol.numarArticol}</span>
                        </div>
                        <div className="database-item-content">
                          <strong>{articol.titlu}</strong>
                          <p className="database-item-description">{articol.definitie?.substring(0, 150)}...</p>
                          <div className="database-item-stats">
                            <div className="sanctions-section">
                              {articol.amendaMin && articol.amendaMax && 
                               articol.amendaMin > 0 && articol.amendaMax > 0 && (
                                articol.amendaMin === articol.amendaMax ? (
                                  <span className="sanction-item">Amendă: {articol.amendaMin}</span>
                                ) : (
                                  <span className="sanction-item">Amendă: {articol.amendaMin} - {articol.amendaMax}</span>
                                )
                              )}
                              {/* Verificare arestMin/arestMax - ambele > 0 */}
                              {(articol.aresteMin !== undefined && articol.aresteMin !== null && articol.aresteMin > 0) && 
                               (articol.aresteMax !== undefined && articol.aresteMax !== null && articol.aresteMax > 0) && (
                                <span className="sanction-item">Arest: {articol.aresteMin} - {articol.aresteMax} luni</span>
                              )}
                              {/* Verificare alternativă pentru arest - prioritizat */}
                              {(!articol.aresteMin && !articol.aresteMax) && (
                                <>
                                  {articol.arest && articol.arest > 0 && <span className="sanction-item">Arest: {articol.arest} luni</span>}
                                  {articol.arest_zile && articol.arest_zile > 0 && <span className="sanction-item">Arest: {articol.arest_zile} luni</span>}
                                </>
                              )}
                              {/* Verificare pentru câmpuri multiple de arest numerice - le combină doar dacă nu există Arest pe viață */}
                              {(() => {
                                const hasArestPeViata = articol.arestPeViata;
                                const numericArestFields = Object.keys(articol).filter(key => 
                                  key.toLowerCase().includes('arest') && 
                                  key !== 'aresteMin' && 
                                  key !== 'aresteMax' && 
                                  key !== 'arest' && 
                                  key !== 'arest_zile' &&
                                  key !== 'arestPeViata' && // Exclude text fields
                                  articol[key] !== undefined && 
                                  articol[key] !== null && 
                                  articol[key] > 0 &&
                                  typeof articol[key] === 'number'
                                );
                                if (!hasArestPeViata && numericArestFields.length > 1) {
                                  return <span className="sanction-item">Arest: {articol[numericArestFields[0]]} - {articol[numericArestFields[1]]} luni</span>;
                                } else if (!hasArestPeViata && numericArestFields.length === 1) {
                                  return <span className="sanction-item">Arest: {articol[numericArestFields[0]]} luni</span>;
                                }
                                return null;
                              })()}
                              {/* Verificare pentru Arest pe viață */}
                              {articol.arestPeViata && <span className="sanction-item">Arest pe viață</span>}
                              {articol.punctePermis > 0 && <span className="sanction-item">Puncte: {articol.punctePermis}</span>}
                              {articol.anularePermis && <span className="sanction-item">Anulare Permis</span>}
                              {articol.perchezitie && <span className="sanction-item">Percheziție</span>}
                              {articol.ridicareVehicul && <span className="sanction-item">Ridicare Vehicul</span>}
                              {articol.dosarPenal && <span className="sanction-item">Dosar Penal</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-section">
                  <div className="section-header">
                    <h3>Vehicule</h3>
                    <button className="glass-button view-all-button" onClick={() => setShowVehiculeModal(true)}>
                      Editează
                    </button>
                  </div>
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <input 
                        type="text"
                        className="search-input"
                        placeholder="Caută vehicule..."
                        value={searchTerms.vehicule}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, vehicule: e.target.value }))}
                      />
                      {searchTerms.vehicule && (
                        <button 
                          className="search-clear-button"
                          onClick={() => setSearchTerms(prev => ({ ...prev, vehicule: '' }))}
                          title="Golește căutarea"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="database-grid">
                    {filterVehicule(databaseData.vehicule || []).map((vehicul, index) => (
                      <div 
                        key={vehicul.id} 
                        className="database-item"
                        onClick={() => showItemDetails(vehicul, 'vehicule')}
                      >
                        <div className="database-item-header">
                          <span className="database-item-title">{vehicul.name}</span>
                        </div>
                        <div className="database-item-content">
                          <div className="database-item-stats">
                            <span>Tip: {vehicul.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-section">
                  <div className="section-header">
                    <h3>Limite de viteză</h3>
                    <button className="glass-button view-all-button" onClick={() => setShowLimiteVitezaModal(true)}>
                      Editează
                    </button>
                  </div>
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <input 
                        type="text"
                        className="search-input"
                        placeholder="Caută limite de viteză..."
                        value={searchTerms.limiteViteza}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, limiteViteza: e.target.value }))}
                      />
                      {searchTerms.limiteViteza && (
                        <button 
                          className="search-clear-button"
                          onClick={() => setSearchTerms(prev => ({ ...prev, limiteViteza: '' }))}
                          title="Golește căutarea"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="database-grid">
                    {filterLimiteViteza(databaseData.limiteViteza || []).map((limita, index) => (
                      <div 
                        key={limita.id} 
                        className="database-item"
                        onClick={() => showItemDetails(limita, 'limiteViteza')}
                      >
                        <div className="database-item-header">
                          <span className="database-item-title">{limita.name}</span>
                        </div>
                        <div className="database-item-content">
                          <div className="database-item-stats">
                            <span>Limită: {limita.limit} km/h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coloana dreaptă - 1 card extins */}
              <div className="database-right-column">
                <div className="glass-section templates-section">
                  <div className="section-header">
                    <h3>Șabloane</h3>
                  </div>
                  <div className="templates-grid">
                    <div className="template-row">
                      <div className="template-field">
                        <label>Intro Autoconstatare</label>
                        <textarea
                          value={templates.introAutoconstatare}
                          onChange={(e) => updateTemplate('introAutoconstatare', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro autoconstatare..."
                        />
                      </div>
                      <div className="template-field">
                        <label>Intro Apel 112</label>
                        <textarea
                          value={templates.introApel112}
                          onChange={(e) => updateTemplate('introApel112', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro apel 112..."
                        />
                      </div>
                    </div>

                    <div className="template-row">
                      <div className="template-field">
                        <label>Intro Focuri de Armă</label>
                        <textarea
                          value={templates.introFocuriArma}
                          onChange={(e) => updateTemplate('introFocuriArma', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro focuri de armă..."
                        />
                      </div>
                      <div className="template-field">
                        <label>Intro Jaf</label>
                        <textarea
                          value={templates.introJaf}
                          onChange={(e) => updateTemplate('introJaf', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro jaf..."
                        />
                      </div>
                    </div>

                    <div className="template-row">
                      <div className="template-field">
                        <label>Intro Furt Auto</label>
                        <textarea
                          value={templates.introFurtAuto}
                          onChange={(e) => updateTemplate('introFurtAuto', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro furt auto..."
                        />
                      </div>
                      <div className="template-field">
                        <label>Intro Acțiune Rutieră</label>
                        <textarea
                          value={templates.introActiuneRutiera}
                          onChange={(e) => updateTemplate('introActiuneRutiera', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro acțiune rutieră..."
                        />
                      </div>
                    </div>

                    <div className="template-row">
                      <div className="template-field">
                        <label>Intro Acțiune Control</label>
                        <textarea
                          value={templates.introActiuneControl}
                          onChange={(e) => updateTemplate('introActiuneControl', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro acțiune control..."
                        />
                      </div>
                      <div className="template-field">
                        <label>Intro Razie S.A.S.</label>
                        <textarea
                          value={templates.introRazieSAS}
                          onChange={(e) => updateTemplate('introRazieSAS', e.target.value)}
                          className="template-textarea"
                          placeholder="Introduceți textul pentru intro razie S.A.S..."
                        />
                      </div>
                    </div>

                    <div className="template-section">
                      <label>Sancțiuni</label>
                      <textarea
                        value={templates.sanctiuni}
                        onChange={(e) => updateTemplate('sanctiuni', e.target.value)}
                        className="template-textarea full-width"
                        placeholder="Introduceți textul pentru sancțiuni..."
                      />
                    </div>

                    <div className="template-section">
                      <label>Structură generală</label>
                      <textarea
                        value={templates.structuraGenerala}
                        onChange={(e) => updateTemplate('structuraGenerala', e.target.value)}
                        className="template-textarea full-width"
                        placeholder="Introduceți textul pentru structură generală..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'updates':
        return (
          <div className="tab-content">
            <div className="updates-section">
              {/* Card Informații Actualizare */}
              <div className="update-info-card">
                <div className="version-info">
                  <div className="version-item">
                    <span className="version-label">Versiune curentă:</span>
                    <span className="version-value current">v{currentVersion}</span>
                  </div>
                  
                  {latestRelease && (
                    <div className="version-item">
                      <span className="version-label">Versiune disponibilă:</span>
                      <span className={`version-value ${hasUpdate ? 'available' : 'up-to-date'}`}>
                        {latestRelease.tag_name}
                      </span>
                    </div>
                  )}
                  
                  <div className="version-item">
                    <span className="version-label">Ultima verificare:</span>
                    <span className="version-value">{lastCheckTime}</span>
                  </div>
                </div>
                
                {latestRelease && (
                  <div className="release-info">
                    <div className="release-header">
                      <h3>{latestRelease.name}</h3>
                      <span className="release-date">
                        Publicat: {formatDate(latestRelease.published_at)}
                      </span>
                      {latestRelease.prerelease && (
                        <span className="prerelease-tag">Pre-release</span>
                      )}
                    </div>
                    
                    <div className="release-notes">
                      <h4>Note de lansare:</h4>
                      <div className="notes-content">
                        {formatReleaseNotes(latestRelease.body)}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="update-actions">
                  <button 
                    className="glass-button check-button"
                    onClick={checkForUpdates}
                    disabled={isCheckingUpdates}
                  >
                    {isCheckingUpdates ? '⏳ Se verifică...' : '🔍 Verifică versiune'}
                  </button>
                  
                  {latestRelease && (
                    <button 
                      className={`glass-button download-button ${hasUpdate ? 'highlight' : ''}`}
                      onClick={downloadLatestVersion}
                      disabled={isDownloading || !hasUpdate}
                    >
                      {isDownloading ? `⏳ Se descarcă... ${downloadProgress}%` : '⬇️ Descarcă ultima versiune'}
                    </button>
                  )}
                </div>
                
                {isDownloading && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                    <span className="progress-text">{downloadProgress}%</span>
                  </div>
                )}
                
                {updateError && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{updateError}</span>
                  </div>
                )}
              </div>

              {/* Card Istoric Releasuri */}
              <div className="history-card">
                <h3>📚 Istoric Releasuri</h3>
                
                {releaseHistory.length > 0 ? (
                  <div className="releases-list">
                    {releaseHistory.slice(0, 3).map((release) => (
                      <div key={release.id} className="release-item">
                        <div className="release-header">
                          <div className="release-info">
                            <span className="release-version">{release.tag_name}</span>
                            <span className="release-date">{formatDate(release.published_at)}</span>
                            {release.prerelease && (
                              <span className="prerelease-tag">Pre-release</span>
                            )}
                          </div>
                          
                          <button 
                            className="glass-button small-button"
                            onClick={() => downloadRelease(release)}
                          >
                            📥 Descarcă
                          </button>
                        </div>
                        
                        {release.body && (
                          <div className="release-description">
                            <div className="release-notes">
                              {formatReleaseNotes(release.body)}
                            </div>
                          </div>
                        )}
                        
                        <div className="release-assets">
                          <span className="assets-label">Fișiere disponibile:</span>
                          <div className="assets-list">
                            {release.assets && release.assets.length > 0 && (
                              <>
                                {release.assets
                                  .filter(asset => asset.name.endsWith('.exe'))
                                  .map(asset => (
                                    <span key={asset.id} className="asset-name">
                                      📄 {asset.name}
                                    </span>
                                  ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-releases">
                    <p>Se încarcă istoricul releasurilor...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <WorkInProgress />;
    }
  };

  // Define default themes with full properties
  const defaultThemes = [
    {
      id: 'default',
      name: 'Default',
      colors: {
        primary: '#ffffff',
        secondary: '#ffffff',
        accent: '#10b981'
      },
      backgrounds: {
        app: { color: '#1a202c', opacity: 1, blur: 0 },
        sidebar: { color: '#1a202c', opacity: 0.95, blur: 0 },
        titlebar: { color: '#1a202c', opacity: 0.9, blur: 0 },
        cards: { color: '#1a202c', opacity: 0.85, blur: 0 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      icons: {
        sidebar: { color: '#ffffff', opacity: 1 },
        dashboard: { color: '#ffffff', opacity: 1 },
        buttons: { color: '#ffffff', opacity: 1 }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'police',
      name: 'Police',
      colors: {
        primary: '#667eea',
        secondary: '#e94560',
        accent: '#48bb78'
      },
      backgrounds: {
        app: { color: '#1a202c', opacity: 1, blur: 0 },
        sidebar: { color: '#1a202c', opacity: 0.95, blur: 0 },
        titlebar: { color: '#1a202c', opacity: 0.9, blur: 0 },
        cards: { color: '#1a202c', opacity: 0.85, blur: 0 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: 'rgba(255, 255, 255, 0.7)' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      icons: {
        sidebar: { color: '#667eea', opacity: 1 },
        dashboard: { color: '#e94560', opacity: 1 },
        buttons: { color: '#48bb78', opacity: 1 }
      },
      borders: {
        width: '1px',
        color: 'rgba(255, 255, 255, 0.15)',
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'sas',
      name: 'S.A.S.',
      colors: {
        primary: '#4299e1',
        secondary: '#ffffff',
        accent: '#63b3ed'
      },
      backgrounds: {
        app: { color: '#1a202c', opacity: 1, blur: 0 },
        sidebar: { color: '#1a202c', opacity: 0.95, blur: 0 },
        titlebar: { color: '#1a202c', opacity: 0.9, blur: 0 },
        cards: { color: '#1a202c', opacity: 0.85, blur: 0 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      icons: {
        sidebar: { color: '#4299e1', opacity: 1 },
        dashboard: { color: '#63b3ed', opacity: 1 },
        buttons: { color: '#ffffff', opacity: 1 }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'military',
      name: 'Military',
      colors: {
        primary: '#68d391',
        secondary: '#4a5568',
        accent: '#48bb78'
      },
      backgrounds: {
        app: { color: '#1a202c', opacity: 1, blur: 0 },
        sidebar: { color: '#1a202c', opacity: 0.95, blur: 0 },
        titlebar: { color: '#1a202c', opacity: 0.9, blur: 0 },
        cards: { color: '#1a202c', opacity: 0.85, blur: 0 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'medical',
      name: 'Medical',
      colors: {
        primary: '#3182ce',
        secondary: '#ffffff',
        accent: '#63b3ed'
      },
      backgrounds: {
        app: { color: '#1a365d', opacity: 1 },
        sidebar: { color: '#1a365d', opacity: 0.95 },
        titlebar: { color: '#1a365d', opacity: 0.9 },
        cards: { color: '#1a365d', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'fire',
      name: 'Fire',
      colors: {
        primary: '#dc2626',
        secondary: '#f97316',
        accent: '#fbbf24'
      },
      backgrounds: {
        app: { color: '#450a0a', opacity: 1 },
        sidebar: { color: '#450a0a', opacity: 0.95 },
        titlebar: { color: '#450a0a', opacity: 0.9 },
        cards: { color: '#450a0a', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'forest',
      name: 'Forest',
      colors: {
        primary: '#10b981',
        secondary: '#065f46',
        accent: '#84cc16'
      },
      backgrounds: {
        app: { color: '#064e3b', opacity: 1 },
        sidebar: { color: '#064e3b', opacity: 0.95 },
        titlebar: { color: '#064e3b', opacity: 0.9 },
        cards: { color: '#064e3b', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'ocean',
      name: 'Ocean',
      colors: {
        primary: '#06b6d4',
        secondary: '#0891b2',
        accent: '#22d3ee'
      },
      backgrounds: {
        app: { color: '#164e63', opacity: 1 },
        sidebar: { color: '#164e63', opacity: 0.95 },
        titlebar: { color: '#164e63', opacity: 0.9 },
        cards: { color: '#164e63', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      colors: {
        primary: '#a855f7',
        secondary: '#06b6d4',
        accent: '#f97316'
      },
      backgrounds: {
        app: { color: '#1e1b4b', opacity: 1 },
        sidebar: { color: '#1e1b4b', opacity: 0.95 },
        titlebar: { color: '#1e1b4b', opacity: 0.9 },
        cards: { color: '#1e1b4b', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: {
        primary: '#f97316',
        secondary: '#fb923c',
        accent: '#fbbf24'
      },
      backgrounds: {
        app: { color: '#7c2d12', opacity: 1 },
        sidebar: { color: '#7c2d12', opacity: 0.95 },
        titlebar: { color: '#7c2d12', opacity: 0.9 },
        cards: { color: '#7c2d12', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'arctic',
      name: 'Arctic',
      colors: {
        primary: '#0284c7',
        secondary: '#7dd3fc',
        accent: '#ffffff'
      },
      backgrounds: {
        app: { color: '#0c4a6e', opacity: 1 },
        sidebar: { color: '#0c4a6e', opacity: 0.95 },
        titlebar: { color: '#0c4a6e', opacity: 0.9 },
        cards: { color: '#0c4a6e', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'midnight',
      name: 'Midnight',
      colors: {
        primary: '#64748b',
        secondary: '#1e293b',
        accent: '#94a3b8'
      },
      backgrounds: {
        app: { color: '#0f172a', opacity: 1 },
        sidebar: { color: '#0f172a', opacity: 0.95 },
        titlebar: { color: '#0f172a', opacity: 0.9 },
        cards: { color: '#0f172a', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'retro',
      name: 'Retro',
      colors: {
        primary: '#d97706',
        secondary: '#92400e',
        accent: '#fbbf24'
      },
      backgrounds: {
        app: { color: '#451a03', opacity: 1 },
        sidebar: { color: '#451a03', opacity: 0.95 },
        titlebar: { color: '#451a03', opacity: 0.9 },
        cards: { color: '#451a03', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      colors: {
        primary: '#6b7280',
        secondary: '#9ca3af',
        accent: '#e5e7eb'
      },
      backgrounds: {
        app: { color: '#1f2937', opacity: 1 },
        sidebar: { color: '#1f2937', opacity: 0.95 },
        titlebar: { color: '#1f2937', opacity: 0.9 },
        cards: { color: '#1f2937', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    },
    {
      id: 'neon',
      name: 'Neon',
      colors: {
        primary: '#ec4899',
        secondary: '#06b6d4',
        accent: '#a855f7'
      },
      backgrounds: {
        app: { color: '#000000', opacity: 1 },
        sidebar: { color: '#000000', opacity: 0.95 },
        titlebar: { color: '#000000', opacity: 0.9 },
        cards: { color: '#000000', opacity: 0.85 }
      },
      texts: {
        main: { family: 'Inter', size: '16px', color: '#ffffff' },
        secondary: { family: 'Inter', size: '14px', color: '#cccccc' },
        titles: { family: 'Inter', size: '24px', color: '#ffffff' },
        buttons: { family: 'Inter', size: '14px', color: '#ffffff' }
      },
      borders: {
        width: '1px',
        color: '#ffffff',
        opacity: 0.1,
        radius: '12px'
      },
      modalBackdrop: {
        color: '#000000',
        opacity: 0.8,
        blur: 15
      },
      modalWindow: {
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        cardsBackgroundColor: '#000000',
        cardsBackgroundOpacity: 0.9,
        buttonSize: 14,
        buttonBackgroundColor: '#ffffff',
        buttonBackgroundOpacity: 0.1
      }
    }
  ];

  // Încarcă temele custom din localStorage la montare
  useEffect(() => {
    const savedThemes = localStorage.getItem('customThemes');
    if (savedThemes) {
      try {
        let parsedThemes = JSON.parse(savedThemes);
        
        // Migrare teme vechi: convertim RGBA în HEX + opacity
        parsedThemes = parsedThemes.map(theme => {
          let migratedTheme = { ...theme };
          
          // Funcție helper pentru a converti RGBA în HEX
          const rgbaToHex = (rgbaString) => {
            if (!rgbaString || !rgbaString.includes('rgba')) return rgbaString;
            
            const rgbMatch = rgbaString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (rgbMatch) {
              const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
              const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
              const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
              return `#${r}${g}${b}`;
            }
            return rgbaString;
          };
          
          // Convertim borders.color
          if (migratedTheme.borders && migratedTheme.borders.color && migratedTheme.borders.color.includes('rgba')) {
            const rgbMatch = migratedTheme.borders.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (rgbMatch) {
              const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
              const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
              const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
              const opacity = parseFloat(rgbMatch[4]);
              
              migratedTheme.borders = {
                ...migratedTheme.borders,
                color: `#${r}${g}${b}`,
                opacity: opacity
              };
            }
          }
          
          // Convertim toate proprietățile de culoare din texts
          if (migratedTheme.texts) {
            Object.keys(migratedTheme.texts).forEach(key => {
              if (migratedTheme.texts[key] && migratedTheme.texts[key].color) {
                migratedTheme.texts[key].color = rgbaToHex(migratedTheme.texts[key].color);
              }
            });
          }
          
          return migratedTheme;
        });
        
        setThemes(parsedThemes);
      } catch (error) {
        console.error('Error loading custom themes:', error);
        setThemes(defaultThemes);
      }
    } else {
      setThemes(defaultThemes);
    }
  }, []);

  const applyTheme = (themeId) => {
  if (isEditMode) {
    // Dacă suntem în mod editare, deschide modalul de editare
    const theme = themes.find(t => t.id === themeId);
    setEditingTheme(theme);
    setCurrentEditTheme(JSON.parse(JSON.stringify(theme))); // Deep copy pentru editare
    setShowEditModal(true);
  } else {
    // Altfel aplică tema normal
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.body.setAttribute('data-theme', themeId);
      applyThemePreview(theme); // Aplică variabilele CSS personalizate
      // Salvează tema selectată
      localStorage.setItem('selectedTheme', themeId);
    }
  }
};

const handleEditTheme = () => {
  if (isEditMode) {
    // Renunță la editare
    setIsEditMode(false);
    setEditingTheme(null);
    setCurrentEditTheme(null);
  } else {
    // Intră în mod editare
    setIsEditMode(true);
  }
};

const handleThemeClick = (themeId) => {
  if (isEditMode) {
    const theme = themes.find(t => t.id === themeId);
    setEditingTheme(theme);
    setCurrentEditTheme(JSON.parse(JSON.stringify(theme))); // Deep copy pentru editare
    setShowEditModal(true);
  } else {
    applyTheme(themeId);
  }
};

// Funcție pentru a aplica modificările în timp real
const updateThemeProperty = (category, property, value, subProperty = null) => {
  const newTheme = { ...currentEditTheme };
  
  // Inițializează modalBackdrop dacă nu există
  if (category === 'modalBackdrop' && !newTheme.modalBackdrop) {
    newTheme.modalBackdrop = {
      color: '#000000',
      opacity: 0.8,
      blur: 15
    };
  }
  
  // Inițializează modalWindow dacă nu există
  if (category === 'modalWindow' && !newTheme.modalWindow) {
    newTheme.modalWindow = {
      backgroundColor: '#000000',
      backgroundOpacity: 0.9,
      cardsBackgroundColor: '#000000',
      cardsBackgroundOpacity: 0.9,
      buttonSize: 14,
      buttonBackgroundColor: '#ffffff',
      buttonBackgroundOpacity: 0.1
    };
  }
  
  // Inițializează borders.opacity dacă nu există (dar nu suprascrie valoarea 0)
  if (category === 'borders' && newTheme.borders.opacity === undefined) {
    newTheme.borders.opacity = 1;
  }
  
  if (subProperty) {
    newTheme[category][property][subProperty] = value;
  } else {
    newTheme[category][property] = value;
  }
  
  setCurrentEditTheme(newTheme);
  applyThemePreview(newTheme);
};

const saveTheme = () => {
  if (currentEditTheme) {
    // Creează o copie a temelor existente
    const updatedThemes = [...themes];
    
    // Găsește index-ul temei originale și înlocuiește-o
    const themeIndex = updatedThemes.findIndex(t => t.id === currentEditTheme.id);
    if (themeIndex !== -1) {
      updatedThemes[themeIndex] = JSON.parse(JSON.stringify(currentEditTheme));
    }
    
    // Actualizează state-ul
    setThemes(updatedThemes);
    
    // Salvează în localStorage
    localStorage.setItem('customThemes', JSON.stringify(updatedThemes));
    
    // Salvează tema selectată
    localStorage.setItem('selectedTheme', currentEditTheme.id);
    
    // Aplică tema salvată
    applyTheme(currentEditTheme.id);
    
    // Ieși din mod editare și închide modalul
    setIsEditMode(false);
    setShowEditModal(false);
    setEditingTheme(null);
    setCurrentEditTheme(null);
  }
};

// Funcție pentru a anula modificările
const cancelEdit = () => {
  // Reaplică tema originală
  if (editingTheme) {
    applyTheme(editingTheme.id);
  }
  
  // Închide modalul
  setShowEditModal(false);
  setEditingTheme(null);
  setCurrentEditTheme(null);
  setIsEditMode(false);
};

  return (
    <div className="settings-page">
      <div className="settings-header-container">
        <div className="glass-header">
          <h1>Setări</h1>
          <p>Configurarea aplicației și preferințe</p>
        </div>

        <div className="tabs-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`glass-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-content-container">
        <div className="tabs-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Themes Modal */}
      {showThemesModal && (
        <div className="themes-modal" onClick={() => setShowThemesModal(false)}>
          <div className="themes-panel" onClick={(e) => e.stopPropagation()}>
            <div className="edit-theme-content no-padding">
              <div className="edit-section">
                <div className="edit-theme-header">
                  <h2>Teme</h2>
                </div>
                <div className="themes-grid">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      className={`theme-card ${isEditMode ? 'edit-mode' : ''}`}
                      onClick={() => handleThemeClick(theme.id)}
                    >
                      <div className="theme-preview">
                        <div style={{ backgroundColor: theme.backgrounds?.app?.color || '#000000' }}></div>
                        <div style={{ backgroundColor: theme.backgrounds?.sidebar?.color || '#333333' }}></div>
                        <div style={{ backgroundColor: theme.backgrounds?.cards?.color || '#555555' }}></div>
                      </div>
                      <h4>{theme.name}</h4>
                    </div>
                  ))}
                </div>
                
                <div className="themes-modal-footer">
                  <button className="glass-button" onClick={handleEditTheme}>
                    {isEditMode ? 'Alege o temă' : 'Editează o temă'}
                  </button>
                  <button 
                    className="glass-button" 
                    onClick={() => {
                      if (isEditMode) {
                        setIsEditMode(false);
                        setEditingTheme(null);
                      } else {
                        setShowThemesModal(false);
                      }
                    }}
                  >
                    {isEditMode ? 'Renunță' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Theme Modal */}
      {showEditModal && editingTheme && currentEditTheme && (
        <div className="edit-theme-modal" onClick={cancelEdit}>
          <div className="edit-theme-panel" onClick={(e) => e.stopPropagation()}>
            <div className="edit-theme-header">
              <h2>Editare Temă: {editingTheme.name}</h2>
            </div>
            
            <div className="edit-theme-content">
              <div className="edit-section">
                <h3>Elemente Fundal</h3>
                <div className="edit-row">
                  <label>Fundal Principal:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme.backgrounds?.app?.color || '#000000'}
                    onChange={(e) => updateThemeProperty('backgrounds', 'app', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme.backgrounds?.app?.opacity || 0.7) * 100}
                    onChange={(e) => updateThemeProperty('backgrounds', 'app', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme.backgrounds?.app?.opacity || 0.7) * 100)}%</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={currentEditTheme.backgrounds?.app?.blur || 0}
                    onChange={(e) => updateThemeProperty('backgrounds', 'app', parseInt(e.target.value), 'blur')}
                  />
                  <span>{currentEditTheme.backgrounds?.app?.blur || 0}px</span>
                </div>
                <div className="edit-row">
                  <label>Fundal Sidebar:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme?.backgrounds?.sidebar?.color || '#333333'}
                    onChange={(e) => updateThemeProperty('backgrounds', 'sidebar', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme?.backgrounds?.sidebar?.opacity || 0.5) * 100}
                    onChange={(e) => updateThemeProperty('backgrounds', 'sidebar', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme?.backgrounds?.sidebar?.opacity || 0.5) * 100)}%</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={currentEditTheme?.backgrounds?.sidebar?.blur || 0}
                    onChange={(e) => updateThemeProperty('backgrounds', 'sidebar', parseInt(e.target.value), 'blur')}
                  />
                  <span>{currentEditTheme?.backgrounds?.sidebar?.blur || 0}px</span>
                </div>
                <div className="edit-row">
                  <label>Fundal Titlebar:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme?.backgrounds?.titlebar?.color || '#1a202c'}
                    onChange={(e) => updateThemeProperty('backgrounds', 'titlebar', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme?.backgrounds?.titlebar?.opacity || 0.9) * 100}
                    onChange={(e) => updateThemeProperty('backgrounds', 'titlebar', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme?.backgrounds?.titlebar?.opacity || 0.9) * 100)}%</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={currentEditTheme?.backgrounds?.titlebar?.blur || 0}
                    onChange={(e) => updateThemeProperty('backgrounds', 'titlebar', parseInt(e.target.value), 'blur')}
                  />
                  <span>{currentEditTheme?.backgrounds?.titlebar?.blur || 0}px</span>
                </div>
                <div className="edit-row">
                  <label>Fundal Carduri:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme?.backgrounds?.cards?.color || '#1a202c'}
                    onChange={(e) => updateThemeProperty('backgrounds', 'cards', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme?.backgrounds?.cards?.opacity || 0.85) * 100}
                    onChange={(e) => updateThemeProperty('backgrounds', 'cards', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme?.backgrounds?.cards?.opacity || 0.85) * 100)}%</span>
                </div>
                <div className="edit-row">
                  <label>Blur Carduri:</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={currentEditTheme?.backgrounds?.cards?.blur || 0}
                    onChange={(e) => updateThemeProperty('backgrounds', 'cards', parseInt(e.target.value), 'blur')}
                  />
                  <span>{currentEditTheme?.backgrounds?.cards?.blur || 0}px</span>
                </div>
              </div>
              
              <div className="edit-section">
                <h3>Iconițe</h3>
                <div className="edit-row">
                  <label>Iconițe Sidebar:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme?.icons?.sidebar?.color || '#ffffff'}
                    onChange={(e) => updateThemeProperty('icons', 'sidebar', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme?.icons?.sidebar?.opacity || 1) * 100}
                    onChange={(e) => updateThemeProperty('icons', 'sidebar', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme?.icons?.sidebar?.opacity || 1) * 100)}%</span>
                </div>
                <div className="edit-row">
                  <label>Iconițe Dashboard:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme?.icons?.dashboard?.color || '#ffffff'}
                    onChange={(e) => updateThemeProperty('icons', 'dashboard', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme?.icons?.dashboard?.opacity || 1) * 100}
                    onChange={(e) => updateThemeProperty('icons', 'dashboard', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme?.icons?.dashboard?.opacity || 1) * 100)}%</span>
                </div>
                <div className="edit-row">
                  <label>Iconițe Butoane:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme?.icons?.buttons?.color || '#ffffff'}
                    onChange={(e) => updateThemeProperty('icons', 'buttons', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(currentEditTheme?.icons?.buttons?.opacity || 1) * 100}
                    onChange={(e) => updateThemeProperty('icons', 'buttons', e.target.value / 100, 'opacity')}
                  />
                  <span>{Math.round((currentEditTheme?.icons?.buttons?.opacity || 1) * 100)}%</span>
                </div>
              </div>
              
              <div className="edit-section">
                <h3>Texte și Fonturi</h3>
                <div className="edit-row">
                  <label>Text Principal:</label>
                  <select 
                    value={currentEditTheme?.texts?.main?.family || 'Inter'}
                    onChange={(e) => updateThemeProperty('texts', 'main', e.target.value, 'family')}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <input 
                    type="color" 
                    value={currentEditTheme?.texts?.main?.color || '#ffffff'}
                    onChange={(e) => updateThemeProperty('texts', 'main', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="12" 
                    max="32" 
                    value={parseInt(currentEditTheme.texts.main.size)}
                    onChange={(e) => updateThemeProperty('texts', 'main', e.target.value + 'px', 'size')}
                  />
                  <span>{currentEditTheme?.texts?.main?.size || '16px'}</span>
                </div>
                <div className="edit-row">
                  <label>Text Secundar:</label>
                  <select 
                    value={currentEditTheme?.texts?.secondary?.family || 'Inter'}
                    onChange={(e) => updateThemeProperty('texts', 'secondary', e.target.value, 'family')}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <input 
                    type="color" 
                    value={currentEditTheme?.texts?.secondary?.color || '#cccccc'}
                    onChange={(e) => updateThemeProperty('texts', 'secondary', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="12" 
                    max="32" 
                    value={parseInt(currentEditTheme.texts.secondary.size)}
                    onChange={(e) => updateThemeProperty('texts', 'secondary', e.target.value + 'px', 'size')}
                  />
                  <span>{currentEditTheme?.texts?.secondary?.size || '14px'}</span>
                </div>
                <div className="edit-row">
                  <label>Titluri:</label>
                  <select 
                    value={currentEditTheme?.texts?.titles?.family || 'Inter'}
                    onChange={(e) => updateThemeProperty('texts', 'titles', e.target.value, 'family')}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <input 
                    type="color" 
                    value={currentEditTheme?.texts?.titles?.color || '#ffffff'}
                    onChange={(e) => updateThemeProperty('texts', 'titles', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="18" 
                    max="48" 
                    value={parseInt(currentEditTheme.texts.titles.size)}
                    onChange={(e) => updateThemeProperty('texts', 'titles', e.target.value + 'px', 'size')}
                  />
                  <span>{currentEditTheme?.texts?.titles?.size || '24px'}</span>
                </div>
                <div className="edit-row">
                  <label>Butoane:</label>
                  <select 
                    value={currentEditTheme?.texts?.buttons?.family || 'Inter'}
                    onChange={(e) => updateThemeProperty('texts', 'buttons', e.target.value, 'family')}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  <input 
                    type="color" 
                    value={currentEditTheme?.texts?.buttons?.color || '#ffffff'}
                    onChange={(e) => updateThemeProperty('texts', 'buttons', e.target.value, 'color')}
                  />
                  <input 
                    type="range" 
                    min="12" 
                    max="32" 
                    value={parseInt(currentEditTheme.texts.buttons.size)}
                    onChange={(e) => updateThemeProperty('texts', 'buttons', e.target.value + 'px', 'size')}
                  />
                  <span>{currentEditTheme?.texts?.buttons?.size || '14px'}</span>
                </div>
              </div>
              
              <div className="edit-section">
                <h3>Modal Window</h3>
                <div className="edit-row">
                  <label>Culoare Card Background:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.backgroundColor : '#000000'}
                    onChange={(e) => updateThemeProperty('modalWindow', 'backgroundColor', e.target.value)}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.backgroundOpacity * 100 : 90}
                    onChange={(e) => updateThemeProperty('modalWindow', 'backgroundOpacity', e.target.value / 100)}
                  />
                  <span>{currentEditTheme.modalWindow ? Math.round(currentEditTheme.modalWindow.backgroundOpacity * 100) : 90}%</span>
                </div>
                <div className="edit-row">
                  <label>Background:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.cardsBackgroundColor : '#000000'}
                    onChange={(e) => updateThemeProperty('modalWindow', 'cardsBackgroundColor', e.target.value)}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.cardsBackgroundOpacity * 100 : 90}
                    onChange={(e) => updateThemeProperty('modalWindow', 'cardsBackgroundOpacity', e.target.value / 100)}
                  />
                  <span>{currentEditTheme.modalWindow ? Math.round(currentEditTheme.modalWindow.cardsBackgroundOpacity * 100) : 90}%</span>
                </div>
                <div className="edit-row">
                  <label>Dimensiune Butoane:</label>
                  <input 
                    type="range" 
                    min="12" 
                    max="24" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.buttonSize : 14}
                    onChange={(e) => updateThemeProperty('modalWindow', 'buttonSize', e.target.value)}
                  />
                  <span>{currentEditTheme.modalWindow ? currentEditTheme.modalWindow.buttonSize : 14}px</span>
                </div>
                <div className="edit-row">
                  <label>Culoare Background Butoane:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.buttonBackgroundColor : '#ffffff'}
                    onChange={(e) => updateThemeProperty('modalWindow', 'buttonBackgroundColor', e.target.value)}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentEditTheme.modalWindow ? currentEditTheme.modalWindow.buttonBackgroundOpacity * 100 : 10}
                    onChange={(e) => updateThemeProperty('modalWindow', 'buttonBackgroundOpacity', e.target.value / 100)}
                  />
                  <span>{currentEditTheme.modalWindow ? Math.round(currentEditTheme.modalWindow.buttonBackgroundOpacity * 100) : 10}%</span>
                </div>
              </div>
              
              <div className="edit-section">
                <h3>Modal Backdrop</h3>
                <div className="edit-row">
                  <label>Culoare Backdrop:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme.modalBackdrop ? currentEditTheme.modalBackdrop.color : '#000000'}
                    onChange={(e) => updateThemeProperty('modalBackdrop', 'color', e.target.value)}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentEditTheme.modalBackdrop ? currentEditTheme.modalBackdrop.opacity * 100 : 80}
                    onChange={(e) => updateThemeProperty('modalBackdrop', 'opacity', e.target.value / 100)}
                  />
                  <span>{currentEditTheme.modalBackdrop ? Math.round(currentEditTheme.modalBackdrop.opacity * 100) : 80}%</span>
                </div>
                <div className="edit-row">
                  <label>Blur Intensitate:</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={currentEditTheme.modalBackdrop ? currentEditTheme.modalBackdrop.blur : 15}
                    onChange={(e) => updateThemeProperty('modalBackdrop', 'blur', parseInt(e.target.value))}
                  />
                  <span>{currentEditTheme.modalBackdrop ? currentEditTheme.modalBackdrop.blur : 15}px</span>
                </div>
              </div>
              
              <div className="edit-section">
                <h3>Borduri și Margini</h3>
                <div className="edit-row">
                  <label>Lățime Bordură:</label>
                  <select 
                    value={currentEditTheme.borders.width}
                    onChange={(e) => updateThemeProperty('borders', 'width', e.target.value)}
                  >
                    <option value="0px">Fără bordură</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="3px">3px</option>
                    <option value="4px">4px</option>
                    <option value="5px">5px</option>
                  </select>
                </div>
                <div className="edit-row">
                  <label>Culoare Bordură:</label>
                  <input 
                    type="color" 
                    value={currentEditTheme.borders.color.includes('#') ? 
                      currentEditTheme.borders.color : 
                      (() => {
                        // Dacă e RGBA, extrage HEX
                        const rgbMatch = currentEditTheme.borders.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
                        if (rgbMatch) {
                          const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
                          const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
                          const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
                          return `#${r}${g}${b}`;
                        }
                        return '#ffffff';
                      })()}
                    onChange={(e) => {
                      const currentOpacity = currentEditTheme.borders.opacity || 1;
                      updateThemeProperty('borders', 'color', e.target.value);
                    }}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentEditTheme.borders.opacity !== undefined ? currentEditTheme.borders.opacity * 100 : 100}
                    onChange={(e) => {
                      const opacity = e.target.value / 100;
                      // Actualizăm doar proprietatea opacity
                      updateThemeProperty('borders', 'opacity', opacity);
                    }}
                  />
                  <span>{currentEditTheme.borders.opacity !== undefined ? Math.round(currentEditTheme.borders.opacity * 100) : 100}%</span>
                </div>
                <div className="edit-row">
                  <label>Rază Colțuri:</label>
                  <select 
                    value={currentEditTheme.borders.radius}
                    onChange={(e) => updateThemeProperty('borders', 'radius', e.target.value)}
                  >
                    <option value="0px">Fără rotunjire</option>
                    <option value="4px">4px</option>
                    <option value="8px">8px</option>
                    <option value="12px">12px</option>
                    <option value="16px">16px</option>
                    <option value="20px">20px</option>
                    <option value="25px">25px</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="edit-theme-footer">
              <button className="glass-button" onClick={saveTheme}>Salvează</button>
              <button className="glass-button" onClick={cancelEdit}>Închide</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Sincronizare */}
      {showSyncModal && (
        <div className="themes-modal" onClick={() => setShowSyncModal(false)}>
          <div className="themes-panel" onClick={(e) => e.stopPropagation()}>
            <div className="edit-theme-content no-padding">
              <div className="edit-section">
                <div className="edit-theme-header">
                  <h2>Setări Sincronizare</h2>
                </div>
                <h3>Module de sincronizat</h3>
                <div className="sync-modules-list">
                  {syncModules.map(module => (
                    <div key={module.id} className="sync-module-item">
                      <label className="sync-module-label">
                        <input 
                          type="checkbox" 
                          checked={module.enabled}
                          onChange={(e) => {
                            setSyncModules(prev => 
                              prev.map(m => 
                                m.id === module.id 
                                  ? { ...m, enabled: e.target.checked }
                                  : m
                              )
                            );
                          }}
                        />
                        <span>{module.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="sync-section">
                  <h3>Setări automate</h3>
                  <div className="sync-module-item">
                    <label className="sync-module-label">
                      <input 
                        type="checkbox" 
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                      />
                      <span>Sincronizare automată</span>
                    </label>
                  </div>
                  <div className="sync-info">
                    <p>Sursa de date: <a href="https://github.com/LaurBalaurAI/helpermdt/blob/main/mdt_data.txt" target="_blank" rel="noopener noreferrer">GitHub MDT Data</a></p>
                    <p>Frecvență sincronizare: {autoSync ? 'La fiecare 30 minute' : 'Manuală'}</p>
                  </div>
                </div>
                
                <div className="sync-footer">
                  <button className="glass-button" onClick={() => setShowSyncModal(false)}>
                    Salvează setările
                  </button>
                  <button className="glass-button" style={{ marginLeft: '1rem' }} onClick={() => setShowSyncModal(false)}>
                    Anulează
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Cod Penal - Listă Completă */}
      {showCodPenalModal && (
        <div className="themes-modal" onClick={() => setShowCodPenalModal(false)}>
          <div className="themes-panel full-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-theme-content no-padding">
              <div className="edit-section">
                <div className="edit-theme-header">
                  <h2>Cod Penal - Toate Articolele</h2>
                </div>
                <div className="modal-actions">
                <button 
                  className="glass-button" 
                  onClick={() => startEditing('codPenal')}
                >
                  {editingModal === 'codPenal' ? 'Alege Articolul' : (selectedItem?.id?.includes('cap.') ? 'Gata' : 'Editează')}
                </button>
                <button 
                  className={`glass-button add-button ${isAddingNew ? 'save-mode' : ''}`}
                  onClick={() => isAddingNew ? saveNewItem() : startAddingNew('codPenal')}
                >
                  {isAddingNew ? '✓' : '+'}
                </button>
                <button 
                  className={`glass-button delete-button ${isDeleting ? 'delete-mode' : ''}`}
                  onClick={() => isDeleting ? cancelEditing() : startDeleting()}
                >
                  {isDeleting ? '🗑️' : '-'}
                </button>
                {selectedItem?.id?.includes('cap.') && (
                  <>
                    <button 
                      className={`glass-button save-button ${saveSuccess ? 'success' : ''}`}
                      onClick={saveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Se salvează...' : (saveSuccess ? '✓ Salvat!' : 'Salvează')}
                    </button>
                    <button 
                      className="glass-button cancel-button" 
                      onClick={cancelEditing}
                    >
                      Anulează
                    </button>
                  </>
                )}
                <button 
                  className="glass-button close-button" 
                  onClick={() => setShowCodPenalModal(false)}
                >
                  Închide
                </button>
              </div>
              
              <div className="database-list full-list">
                {/* Afișăm formularul de adăugare dacă suntem în modul de adăugare */}
                {isAddingNew && editingItem && (
                  <div className="database-item selected">
                    <div className="edit-form">
                      <div className="edit-row">
                        <label>Capitol:</label>
                        <input 
                          type="text" 
                          value={editingItem?.cap || ''}
                          onChange={(e) => updateEditingItem('cap', e.target.value)}
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Articol:</label>
                        <input 
                          type="text" 
                          value={editingItem?.numarArticol || ''}
                          onChange={(e) => updateEditingItem('numarArticol', e.target.value)}
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Titlu:</label>
                        <input 
                          type="text" 
                          value={editingItem?.titlu || ''}
                          onChange={(e) => updateEditingItem('titlu', e.target.value)}
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Definiție:</label>
                        <textarea 
                          value={editingItem?.definitie || ''}
                          onChange={(e) => updateEditingItem('definitie', e.target.value)}
                          className="edit-textarea"
                          rows={4}
                        />
                      </div>
                      <div className="edit-row">
                        <label>Amandă Min:</label>
                        <input 
                          type="number" 
                          value={editingItem?.amendaMin || ''}
                          onChange={(e) => updateEditingItem('amendaMin', parseInt(e.target.value))}
                          className="edit-input small"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Amandă Max:</label>
                        <input 
                          type="number" 
                          value={editingItem?.amendaMax || ''}
                          onChange={(e) => updateEditingItem('amendaMax', parseInt(e.target.value))}
                          className="edit-input small"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Arest Min:</label>
                        <input 
                          type="number" 
                          value={editingItem?.aresteMin || ''}
                          onChange={(e) => updateEditingItem('aresteMin', parseInt(e.target.value))}
                          className="edit-input small"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Arest Max:</label>
                        <input 
                          type="number" 
                          value={editingItem?.aresteMax || ''}
                          onChange={(e) => updateEditingItem('aresteMax', parseInt(e.target.value))}
                          className="edit-input small"
                        />
                      </div>
                      <div className="edit-row">
                        <label>Puncte Permis:</label>
                        <input 
                          type="number" 
                          value={editingItem?.punctePermis || ''}
                          onChange={(e) => updateEditingItem('punctePermis', parseInt(e.target.value))}
                          className="edit-input small"
                        />
                      </div>
                      <div className="edit-row checkbox-row">
                        <label>Sancțiuni suplimentare:</label>
                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={editingItem?.anularePermis || false}
                              onChange={(e) => updateEditingItem('anularePermis', e.target.checked)}
                            />
                            Anulare Permis
                          </label>
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={editingItem?.perchezitie || false}
                              onChange={(e) => updateEditingItem('perchezitie', e.target.checked)}
                            />
                            Percheziție
                          </label>
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={editingItem?.ridicareVehicul || false}
                              onChange={(e) => updateEditingItem('ridicareVehicul', e.target.checked)}
                            />
                            Ridicare Vehicul
                          </label>
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={editingItem?.dosarPenal || false}
                              onChange={(e) => updateEditingItem('dosarPenal', e.target.checked)}
                            />
                            Dosar Penal
                          </label>
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={editingItem?.arestPeViata || false}
                              onChange={(e) => updateEditingItem('arestPeViata', e.target.checked)}
                            />
                            Arest pe Viață
                          </label>
                        </div>
                      </div>
                      <div className="edit-row">
                        <button 
                          className="glass-button cancel-button" 
                          onClick={cancelEditing}
                        >
                          Anulează
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {databaseData.codPenal?.map((articol, index) => (
                  <div 
                    key={articol.id} 
                    className={`database-item ${editingModal === 'codPenal' ? 'selectable' : ''} ${isDeleting ? 'deletable' : ''} ${selectedItem?.id === articol.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (isDeleting) {
                        deleteItem(articol, 'codPenal');
                      } else if (editingModal === 'codPenal') {
                        selectItemForEdit(articol, 'codPenal');
                      }
                    }}
                  >
                    {selectedItem?.id === articol.id ? (
                      // Mod editare inline
                      <div className="edit-form">
                        <div className="edit-row">
                          <label>Capitol:</label>
                          <input 
                            type="text" 
                            value={editingItem?.cap || ''}
                            onChange={(e) => updateEditingItem('cap', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Articol:</label>
                          <input 
                            type="text" 
                            value={editingItem?.numarArticol || ''}
                            onChange={(e) => updateEditingItem('numarArticol', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Titlu:</label>
                          <input 
                            type="text" 
                            value={editingItem?.titlu || ''}
                            onChange={(e) => updateEditingItem('titlu', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Definiție:</label>
                          <textarea 
                            value={editingItem?.definitie || ''}
                            onChange={(e) => updateEditingItem('definitie', e.target.value)}
                            className="edit-textarea"
                            rows={4}
                          />
                        </div>
                        <div className="edit-row">
                          <label>Amandă Min:</label>
                          <input 
                            type="number" 
                            value={editingItem?.amendaMin || ''}
                            onChange={(e) => updateEditingItem('amendaMin', parseInt(e.target.value))}
                            className="edit-input small"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Amandă Max:</label>
                          <input 
                            type="number" 
                            value={editingItem?.amendaMax || ''}
                            onChange={(e) => updateEditingItem('amendaMax', parseInt(e.target.value))}
                            className="edit-input small"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Arest Min:</label>
                          <input 
                            type="number" 
                            value={editingItem?.aresteMin || ''}
                            onChange={(e) => updateEditingItem('aresteMin', parseInt(e.target.value))}
                            className="edit-input small"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Arest Max:</label>
                          <input 
                            type="number" 
                            value={editingItem?.aresteMax || ''}
                            onChange={(e) => updateEditingItem('aresteMax', parseInt(e.target.value))}
                            className="edit-input small"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Puncte Permis:</label>
                          <input 
                            type="number" 
                            value={editingItem?.punctePermis || ''}
                            onChange={(e) => updateEditingItem('punctePermis', parseInt(e.target.value))}
                            className="edit-input small"
                          />
                        </div>
                        <div className="edit-row checkbox-row">
                          <label>Sancțiuni suplimentare:</label>
                          <div className="checkbox-group">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={editingItem?.anularePermis || false}
                                onChange={(e) => updateEditingItem('anularePermis', e.target.checked)}
                              />
                              Anulare Permis
                            </label>
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={editingItem?.perchezitie || false}
                                onChange={(e) => updateEditingItem('perchezitie', e.target.checked)}
                              />
                              Percheziție
                            </label>
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={editingItem?.arestPeViata || false}
                                onChange={(e) => updateEditingItem('arestPeViata', e.target.checked)}
                              />
                              Arest pe viață
                            </label>
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={editingItem?.ridicareVehicul || false}
                                onChange={(e) => updateEditingItem('ridicareVehicul', e.target.checked)}
                              />
                              Ridicare vehicul
                            </label>
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={editingItem?.dosarPenal || false}
                                onChange={(e) => updateEditingItem('dosarPenal', e.target.checked)}
                              />
                              Dosar penal
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Mod vizualizare
                      <>
                        <div className="database-item-header">
                          <span className="database-item-title">{articol.cap} - Art. {articol.numarArticol}</span>
                        </div>
                        <div className="database-item-content">
                          <strong>{articol.titlu}</strong>
                          <p className="database-item-description">{articol.definitie?.substring(0, 200)}...</p>
                          <div className="database-item-stats">
                            {articol.amendaMin && articol.amendaMax && 
                             articol.amendaMin > 0 && articol.amendaMax > 0 && (
                              <span>Amendă: {articol.amendaMin === articol.amendaMax ? `${articol.amendaMin}` : `${articol.amendaMin} - ${articol.amendaMax}`}</span>
                            )}
                            {/* Verificare arestMin/arestMax - ambele > 0 */}
                            {(articol.aresteMin !== undefined && articol.aresteMin !== null && articol.aresteMin > 0) && 
                             (articol.aresteMax !== undefined && articol.aresteMax !== null && articol.aresteMax > 0) && (
                              <span>Arest: {articol.aresteMin} - {articol.aresteMax} luni</span>
                            )}
                            {articol.punctePermis > 0 && <span>Puncte: {articol.punctePermis}</span>}
                            {articol.anularePermis && <span>Anulare Permis</span>}
                            {articol.perchezitie && <span>Percheziție</span>}
                            {articol.arestPeViata && <span>Arest pe viață</span>}
                            {articol.ridicareVehicul && <span>Ridicare vehicul</span>}
                            {articol.dosarPenal && <span>Dosar penal</span>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Vehicule - Listă Completă */}
      {showVehiculeModal && (
        <div className="themes-modal" onClick={() => setShowVehiculeModal(false)}>
          <div className="themes-panel full-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-theme-content no-padding">
              <div className="edit-section">
                <div className="edit-theme-header">
                  <h2>Vehicule - Listă Completă</h2>
                </div>
                <div className="modal-actions">
                <button 
                  className="glass-button" 
                  onClick={() => startEditing('vehicule')}
                >
                  {editingModal === 'vehicule' ? 'Alege Vehiculul' : (selectedItem?.id?.includes('_autoturism') || selectedItem?.id?.includes('service') || selectedItem?.id?.includes('maii') ? 'Gata' : 'Editează')}
                </button>
                <button 
                  className={`glass-button add-button ${isAddingNew ? 'save-mode' : ''}`}
                  onClick={() => isAddingNew ? saveNewItem() : startAddingNew('vehicule')}
                >
                  {isAddingNew ? '✓' : '+'}
                </button>
                <button 
                  className={`glass-button delete-button ${isDeleting ? 'delete-mode' : ''}`}
                  onClick={() => isDeleting ? cancelEditing() : startDeleting()}
                >
                  {isDeleting ? '🗑️' : '-'}
                </button>
                {(selectedItem?.id?.includes('_autoturism') || selectedItem?.id?.includes('service') || selectedItem?.id?.includes('maii')) && (
                  <>
                    <button 
                      className={`glass-button save-button ${saveSuccess ? 'success' : ''}`}
                      onClick={saveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Se salvează...' : (saveSuccess ? '✓ Salvat!' : 'Salvează')}
                    </button>
                    <button 
                      className="glass-button cancel-button" 
                      onClick={cancelEditing}
                    >
                      Anulează
                    </button>
                  </>
                )}
                <button 
                  className="glass-button close-button" 
                  onClick={() => setShowVehiculeModal(false)}
                >
                  Închide
                </button>
              </div>
              
              <div className="database-list full-list">
                {databaseData.vehicule?.map((vehicul, index) => (
                  <div 
                    key={vehicul.id} 
                    className={`database-item ${editingModal === 'vehicule' ? 'selectable' : ''} ${isDeleting ? 'deletable' : ''} ${selectedItem?.id === vehicul.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (isDeleting) {
                        deleteItem(vehicul, 'vehicule');
                      } else if (editingModal === 'vehicule') {
                        selectItemForEdit(vehicul, 'vehicule');
                      }
                    }}
                  >
                    {selectedItem?.id === vehicul.id ? (
                      // Mod editare inline
                      <div className="edit-form">
                        <div className="edit-row">
                          <label>Nume:</label>
                          <input 
                            type="text" 
                            value={editingItem?.name || ''}
                            onChange={(e) => updateEditingItem('name', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Tip:</label>
                          <input 
                            type="text" 
                            value={editingItem?.type || ''}
                            onChange={(e) => updateEditingItem('type', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>ID:</label>
                          <input 
                            type="text" 
                            value={editingItem?.id || ''}
                            onChange={(e) => updateEditingItem('id', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                      </div>
                    ) : (
                      // Mod vizualizare
                      <>
                        <div className="database-item-header">
                          <span className="database-item-title">{vehicul.name}</span>
                        </div>
                        <div className="database-item-content">
                          <div className="database-item-stats">
                            <span>Tip: {vehicul.type}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Limite de Viteză - Listă Completă */}
      {showLimiteVitezaModal && (
        <div className="themes-modal" onClick={() => setShowLimiteVitezaModal(false)}>
          <div className="themes-panel full-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-theme-content no-padding">
              <div className="edit-section">
                <div className="edit-theme-header">
                  <h2>Limite de Viteză - Listă Completă</h2>
                </div>
                <div className="modal-actions">
                <button 
                  className="glass-button" 
                  onClick={() => startEditing('limiteViteza')}
                >
                  {editingModal === 'limiteViteza' ? 'Alege Limita' : (selectedItem && !selectedItem.id.includes('cap.') && !selectedItem.id.includes('_autoturism') && !selectedItem.id.includes('service') && !selectedItem.id.includes('maii') ? 'Gata' : 'Editează')}
                </button>
                <button 
                  className={`glass-button add-button ${isAddingNew ? 'save-mode' : ''}`}
                  onClick={() => isAddingNew ? saveNewItem() : startAddingNew('limiteViteza')}
                >
                  {isAddingNew ? '✓' : '+'}
                </button>
                <button 
                  className={`glass-button delete-button ${isDeleting ? 'delete-mode' : ''}`}
                  onClick={() => isDeleting ? cancelEditing() : startDeleting()}
                >
                  {isDeleting ? '🗑️' : '-'}
                </button>
                {selectedItem && !selectedItem.id.includes('cap.') && !selectedItem.id.includes('_autoturism') && !selectedItem.id.includes('service') && !selectedItem.id.includes('maii') && (
                  <>
                    <button 
                      className={`glass-button save-button ${saveSuccess ? 'success' : ''}`}
                      onClick={saveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Se salvează...' : (saveSuccess ? '✓ Salvat!' : 'Salvează')}
                    </button>
                    <button 
                      className="glass-button cancel-button" 
                      onClick={cancelEditing}
                    >
                      Anulează
                    </button>
                  </>
                )}
                <button 
                  className="glass-button close-button" 
                  onClick={() => setShowLimiteVitezaModal(false)}
                >
                  Închide
                </button>
              </div>
              
              <div className="database-list full-list">
                {databaseData.limiteViteza?.map((limita, index) => (
                  <div 
                    key={limita.id} 
                    className={`database-item ${editingModal === 'limiteViteza' ? 'selectable' : ''} ${isDeleting ? 'deletable' : ''} ${selectedItem?.id === limita.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (isDeleting) {
                        deleteItem(limita, 'limiteViteza');
                      } else if (editingModal === 'limiteViteza') {
                        selectItemForEdit(limita, 'limiteViteza');
                      }
                    }}
                  >
                    {selectedItem?.id === limita.id ? (
                      // Mod editare inline
                      <div className="edit-form">
                        <div className="edit-row">
                          <label>Nume locație:</label>
                          <input 
                            type="text" 
                            value={editingItem?.name || ''}
                            onChange={(e) => updateEditingItem('name', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Limită viteză:</label>
                          <input 
                            type="number" 
                            value={editingItem?.limit || ''}
                            onChange={(e) => updateEditingItem('limit', parseInt(e.target.value))}
                            className="edit-input small"
                          />
                          <span style={{ marginLeft: '0.5rem', color: 'var(--text-color, #ffffff)' }}>km/h</span>
                        </div>
                        <div className="edit-row">
                          <label>ID:</label>
                          <input 
                            type="text" 
                            value={editingItem?.id || ''}
                            onChange={(e) => updateEditingItem('id', e.target.value)}
                            className="edit-input"
                          />
                        </div>
                      </div>
                    ) : (
                      // Mod vizualizare
                      <>
                        <div className="database-item-header">
                          <span className="database-item-title">{limita.name}</span>
                        </div>
                        <div className="database-item-content">
                          <div className="database-item-stats">
                            <span>Limită: {limita.limit} km/h</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup Detalii */}
      {showDetailPopup && detailItem && (
        <div className="detail-popup" onClick={closeDetailPopup}>
          <div className="detail-popup-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-popup-header">
              <h2>
                {detailType === 'codPenal' && `${detailItem.cap} - Art. ${detailItem.numarArticol}`}
                {detailType === 'vehicule' && detailItem.name}
                {detailType === 'limiteViteza' && detailItem.name}
              </h2>
              <button className="close-button" onClick={closeDetailPopup}>×</button>
            </div>
            <div className="detail-popup-content">
              {detailType === 'codPenal' && (
                <>
                  <h3>{detailItem.titlu}</h3>
                  <div className="detail-section">
                    <h4>Definiție:</h4>
                    <p>{detailItem.definitie}</p>
                  </div>
                  <div className="detail-section">
                    <h4>Sancțiuni:</h4>
                    {detailItem.amendaMin && detailItem.amendaMax && 
                     (detailItem.amendaMin > 0 || detailItem.amendaMax > 0) && (
                      <p>Amendă: {detailItem.amendaMin === detailItem.amendaMax ? detailItem.amendaMin : `${detailItem.amendaMin} - ${detailItem.amendaMax}`}</p>
                    )}
                    {(detailItem.aresteMin !== undefined && detailItem.aresteMin !== null && detailItem.aresteMin > 0) && 
                     (detailItem.aresteMax !== undefined && detailItem.aresteMax !== null && detailItem.aresteMax > 0) && (
                      <p>Arest: {detailItem.aresteMin} - {detailItem.aresteMax} luni</p>
                    )}
                    {/* Verificare alternativă - poate câmpurile au alte nume */}
                    {(!detailItem.aresteMin && !detailItem.aresteMax) && (
                      <div>
                        {detailItem.arest && detailItem.arest > 0 && <p>Arest: {detailItem.arest} luni</p>}
                        {detailItem.arest_zile && detailItem.arest_zile > 0 && <p>Arest: {detailItem.arest_zile} luni</p>}
                      </div>
                    )}
                    {/* Afișare generală pentru orice câmp de arest */}
                    {Object.keys(detailItem).filter(key => key.toLowerCase().includes('arest') && key !== 'aresteMin' && key !== 'aresteMax').map(key => (
                      detailItem[key] && detailItem[key] > 0 && (
                        <p key={key}>Arest ({key}): {detailItem[key]} {key.includes('luni') || key.includes('zile') ? '' : 'luni'}</p>
                      )
                    ))}
                    {detailItem.dosarPenal && <p>Dosar Penal</p>}
                    {detailItem.perchezitie && <p>Percheziție</p>}
                    {detailItem.ridicareVehicul && <p>Ridicare Vehicul</p>}
                    {detailItem.punctePermis > 0 && <p>Puncte Permis: {detailItem.punctePermis}</p>}
                    {detailItem.anularePermis && <p>Anulare Permis</p>}
                  </div>
                </>
              )}
              {detailType === 'vehicule' && (
                <>
                  <p><strong>Tip:</strong> {detailItem.type}</p>
                  {detailItem.model && <p><strong>Model:</strong> {detailItem.model}</p>}
                  {detailItem.marca && <p><strong>Marca:</strong> {detailItem.marca}</p>}
                  {detailItem.categorie && <p><strong>Categorie:</strong> {detailItem.categorie}</p>}
                  {detailItem.anFabricatie && <p><strong>An fabricație:</strong> {detailItem.anFabricatie}</p>}
                  {detailItem.putere && <p><strong>Putere:</strong> {detailItem.putere}</p>}
                  {detailItem.capacitateCilindrica && <p><strong>Capacitate cilindrică:</strong> {detailItem.capacitateCilindrica}</p>}
                  {detailItem.taraOrigine && <p><strong>Tara origine:</strong> {detailItem.taraOrigine}</p>}
                  {detailItem.normeEuro && <p><strong>Norme Euro:</strong> {detailItem.normeEuro}</p>}
                </>
              )}
              {detailType === 'limiteViteza' && (
                <>
                  <div className="detail-section">
                    <p><strong>Limită:</strong> {detailItem.limit} km/h</p>
                    {detailItem.location && <p><strong>Locație:</strong> {detailItem.location}</p>}
                    {detailItem.tipZona && <p><strong>Tip zonă:</strong> {detailItem.tipZona}</p>}
                    {detailItem.tipVehicul && <p><strong>Tip vehicul:</strong> {detailItem.tipVehicul}</p>}
                    {detailItem.conditiiSpeciale && <p><strong>Condiții speciale:</strong> {detailItem.conditiiSpeciale}</p>}
                    {detailItem.sanctiuni && <p><strong>Sancțiuni:</strong> {detailItem.sanctiuni}</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
