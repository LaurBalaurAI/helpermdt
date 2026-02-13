import React, { createContext, useState, useEffect } from 'react';

// Funcție pentru normalizarea textului (fără diacritice)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Funcție de încărcare date din localStorage
const loadLocalData = () => {
  try {
    const savedData = localStorage.getItem('databaseData');
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Eroare la încărcarea datelor locale:', error);
    return null;
  }
};

// Funcție de salvare date în localStorage
const saveLocalData = (data) => {
  try {
    localStorage.setItem('databaseData', JSON.stringify(data));
  } catch (error) {
    console.error('Eroare la salvarea datelor locale:', error);
  }
};

// Funcție de sincronizare cu GitHub
const syncWithGitHub = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/LaurBalaurAI/helpermdt/main/src/resources/database.json');
    const data = await response.json();
    
    const updatedData = {
      codPenal: data.codPenal || [],
      vehicule: data.vehicule || [],
      limiteViteza: data.limiteViteza || [],
      templates: data.templates || {},
      binds: data.binds || {},
      aiLogic: data.aiLogic || {},
      aiSettings: data.aiSettings || {}
    };
    
    saveLocalData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Eroare la sincronizarea cu GitHub:', error);
    return null;
  }
};

// Context pentru baza de date
const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [databaseData, setDatabaseData] = useState({
    codPenal: [],
    vehicule: [],
    limiteViteza: [],
    templates: {},
    binds: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  // Încărcare inițială a datelor
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        // Încercăm sincronizarea cu GitHub
        const syncedData = await syncWithGitHub();
        
        if (syncedData) {
          setDatabaseData(syncedData);
          setLastSync(new Date());
          console.log('Date sincronizate cu succes de la GitHub');
        } else {
          // Fallback la datele locale
          const localData = loadLocalData();
          if (localData) {
            setDatabaseData(localData);
            console.log('Încărcate date locale ca fallback');
          }
        }
      } catch (error) {
        console.error('Eroare la inițializarea datelor:', error);
        // Încercăm fallback la datele locale
        const localData = loadLocalData();
        if (localData) {
          setDatabaseData(localData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Funcții de filtrare
  const filterCodPenal = (searchTerm) => {
    if (!searchTerm || !databaseData.codPenal) return databaseData.codPenal || [];
    const normalizedSearch = normalizeText(searchTerm);
    return databaseData.codPenal.filter(articol => 
      (articol.cap && normalizeText(articol.cap).includes(normalizedSearch)) ||
      (articol.numarArticol && normalizeText(articol.numarArticol).includes(normalizedSearch)) ||
      (articol.titlu && normalizeText(articol.titlu).includes(normalizedSearch)) ||
      (articol.definitie && normalizeText(articol.definitie).includes(normalizedSearch))
    );
  };

  const filterVehicule = (searchTerm) => {
    if (!searchTerm || !databaseData.vehicule) return databaseData.vehicule || [];
    const normalizedSearch = normalizeText(searchTerm);
    return databaseData.vehicule.filter(vehicul => 
      (vehicul.name && normalizeText(vehicul.name).includes(normalizedSearch)) ||
      (vehicul.type && normalizeText(vehicul.type).includes(normalizedSearch)) ||
      (vehicul.id && normalizeText(vehicul.id).includes(normalizedSearch))
    );
  };

  const filterLimiteViteza = (searchTerm) => {
    if (!searchTerm || !databaseData.limiteViteza) return databaseData.limiteViteza || [];
    const normalizedSearch = normalizeText(searchTerm);
    return databaseData.limiteViteza.filter(limita => 
      (limita.name && normalizeText(limita.name).includes(normalizedSearch)) ||
      (limita.location && normalizeText(limita.location).includes(normalizedSearch)) ||
      (limita.id && normalizeText(limita.id).includes(normalizedSearch))
    );
  };

  // Funcții de actualizare date
  const updateDatabaseData = (newData) => {
    setDatabaseData(newData);
    saveLocalData(newData);
  };

  const value = {
    databaseData,
    setDatabaseData,
    isLoading,
    lastSync,
    filterCodPenal,
    filterVehicule,
    filterLimiteViteza,
    updateDatabaseData,
    loadLocalData,
    syncWithGitHub: async () => {
      const syncedData = await syncWithGitHub();
      if (syncedData) {
        setDatabaseData(syncedData);
        setLastSync(new Date());
        return true;
      }
      return false;
    }
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = React.useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export default DatabaseContext;
