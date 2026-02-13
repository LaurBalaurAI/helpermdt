import React, { useState, useEffect, useCallback } from 'react';
import '../styles/MDTPage.css';
import { useDatabase } from '../contexts/DatabaseContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

const MDTPage = () => {
  const { databaseData, isLoading, filterCodPenal } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [detailType, setDetailType] = useState('');
  const [selectedResultId, setSelectedResultId] = useState(null); // Pentru a ține minte rezultatul selectat
  
  // State pentru autocomplete locație
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  
  // State pentru autocomplete infracțiuni (câmpuri separate)
  const [infractiune1SearchTerm, setInfractiune1SearchTerm] = useState('');
  const [infractiune1SearchResults, setInfractiune1SearchResults] = useState([]);
  const [showInfractiune1Dropdown, setShowInfractiune1Dropdown] = useState(false);
  const [selectedInfractiune1Id, setSelectedInfractiune1Id] = useState(null);
  
  const [infractiune2SearchTerm, setInfractiune2SearchTerm] = useState('');
  const [infractiune2SearchResults, setInfractiune2SearchResults] = useState([]);
  const [showInfractiune2Dropdown, setShowInfractiune2Dropdown] = useState(false);
  const [selectedInfractiune2Id, setSelectedInfractiune2Id] = useState(null);
  
  const [infractiune3SearchTerm, setInfractiune3SearchTerm] = useState('');
  const [infractiune3SearchResults, setInfractiune3SearchResults] = useState([]);
  const [showInfractiune3Dropdown, setShowInfractiune3Dropdown] = useState(false);
  const [selectedInfractiune3Id, setSelectedInfractiune3Id] = useState(null);
  
  // State pentru autocomplete vehicule
  const [vehicleTypeSearchTerm, setVehicleTypeSearchTerm] = useState('');
  const [vehicleTypeSearchResults, setVehicleTypeSearchResults] = useState([]);
  const [showVehicleTypeDropdown, setShowVehicleTypeDropdown] = useState(false);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState(null);
  
  // State pentru autocomplete documente
  const [document1SearchTerm, setDocument1SearchTerm] = useState('');
  const [document1SearchResults, setDocument1SearchResults] = useState([]);
  const [showDocument1Dropdown, setShowDocument1Dropdown] = useState(false);
  const [selectedDocument1Id, setSelectedDocument1Id] = useState(null);
  
  const [document2SearchTerm, setDocument2SearchTerm] = useState('');
  const [document2SearchResults, setDocument2SearchResults] = useState([]);
  const [showDocument2Dropdown, setShowDocument2Dropdown] = useState(false);
  const [selectedDocument2Id, setSelectedDocument2Id] = useState(null);
  
  // State pentru autocomplete autospecială
  const [autospecialaSearchTerm, setAutospecialaSearchTerm] = useState('');
  const [autospecialaSearchResults, setAutospecialaSearchResults] = useState([]);
  const [showAutospecialaDropdown, setShowAutospecialaDropdown] = useState(false);
  const [selectedAutospecialaId, setSelectedAutospecialaId] = useState(null);
  
  const [vehicleModelSearchTerm, setVehicleModelSearchTerm] = useState('');
  const [vehicleModelSearchResults, setVehicleModelSearchResults] = useState([]);
  const [showVehicleModelDropdown, setShowVehicleModelDropdown] = useState(false);
  const [selectedVehicleModelId, setSelectedVehicleModelId] = useState(null);
  
  // State pentru toggle secțiuni
  const [showSubstanteSection, setShowSubstanteSection] = useState(false);
  const [showPerchezitieSection, setShowPerchezitieSection] = useState(false);
  const [showCrimaOrganizataSection, setShowCrimaOrganizataSection] = useState(false);
  const [showLicenteSection, setShowLicenteSection] = useState(false);
  
  // State pentru cardurile detaliabile - toate mereu vizibile
  const [openCards] = useState({
    generale: true,
    vehicul: true,
    constatare: true,
    incadrare: true
  });
  
  // State pentru datele din carduri cu placeholders
  const [cardData, setCardData] = useState({
    generale: {
      numeSuspect: '',
      cnpSuspect: '',
      sexSuspect: 'masculin',
      suspectComplice: false,
      numeParteVatamate: '',
      cnpParteVatamate: '',
      cnpParteVatamataType: '',
      sexVictima: 'masculin',
      victimaPolitie: false,
      locatia: '',
      dataOra: '',
      data: '',
      ora: '',
      vitezaInregistrata: '',
      limitaViteza: '',
      patrula: '',
      obiectivJaf: '' // Câmp pentru obiectiv jaf - apare doar când este selectat "Jaf"
    },
    vehicul: {
      tipVehicul: '',
      modelVehicul: '',
      culoareVehicul: '',
      numereInmatriculare: '',
      autospeciala: ''
    },
    constatare: {
      tipConstatare: 'autoconstatare',
      substantaSubInfluenta: '', // Changed from boolean false to empty string
      tipSubstanta: '',
      rezultatTest: '',
      perchezitie: false,
      buzunare: false,
      buzunareText: '',
      buzunareContinut: '', // Added for old app compatibility
      torpedo: false,
      torpedoText: '',
      torpedoContinut: '', // Added for old app compatibility
      portbagaj: false,
      portbagajText: '',
      portbagajContinut: '', // Added for old app compatibility
      crimaOrganizata: false,
      tigariContrabanda: '',
      droguriRisc: '',
      droguriRiscCantitate: '',
      droguriMareRisc: '',
      droguriMareRiscCantitate: '',
      baniMurdari: '',
      licente: false,
      licenteCheckbox: false, // Added for old app compatibility
      lipsaLicenta1: '', // Renamed from documentLipsa1
      lipsaLicenta2: '' // Renamed from documentLipsa2
    },
    incadrare: {
      infractiune1: '',
      previzualizare1: 'cetățeanul {nume} ({cnp}) avea în posesie {perchezitie_buzunare_continut}, {perchezitie_torpedo_continut}, {perchezitie_portbagaj_continut}, fapt ilegal',
      mentiuni1: '',
      infractiune2: '',
      previzualizare2: 'cetățeanul {nume} ({cnp}) conducea {tipVehicul}, marca {modelVehicul} de culoare {culoareVehicul}, {nr_inmatriculare}, folosind telefonul mobil în timpul condusului.',
      mentiuni2: '',
      infractiune3: '',
      previzualizare3: 'cetățeanul {nume} ({cnp}) conducea {tipVehicul}, marca {modelVehicul} de culoare {culoareVehicul}, {nr_inmatriculare}, folosind telefonul mobil în timpul condusului.',
      mentiuni3: ''
    },
    sanctiuni: {
      amendaTotala: '',
      amendaManuala: '', // Renamed from amandaManuala
      arestTotal: '',
      arestManual: '',
      punctePermis: '',
      anularePermis: false,
      dosarPenal: false,
      perchezitie: false,
      ridicareVehicul: false,
      locatieDetentie: 'Penitenciarul LS'
    },
    descriereCaz: {
      titlu: '',
      descriere: ''
    }
  });
  // Master template și placeholders cu logica exactă din aplicația veche
  const [masterTemplate, setMasterTemplate] = useState(`{header}{intro}{infraction_1_desc}{mentiuni_1}{infraction_2_desc}{mentiuni_2}{infraction_3_desc}{mentiuni_3}\n{sanctiuni_descriere}`);
  
  // Funcție pentru a genera template-ul dinamic în funcție de infracțiunile selectate
  const generateDynamicTemplate = useCallback((data) => {
    let template = '{header}{intro}';
    
    // Adăugăm doar infracțiunile care au text
    if (data.incadrare.infractiune1 && data.incadrare.infractiune1.trim() !== '') {
      template += '{infraction_1_desc}{mentiuni_1}';
    }
    if (data.incadrare.infractiune2 && data.incadrare.infractiune2.trim() !== '') {
      template += '{infraction_2_desc}{mentiuni_2}';
    }
    if (data.incadrare.infractiune3 && data.incadrare.infractiune3.trim() !== '') {
      template += '{infraction_3_desc}{mentiuni_3}';
    }
    
    template += '\n{sanctiuni_descriere}';
    return template;
  }, []);
  
  const [compositePlaceholders, setCompositePlaceholders] = useState({
    'header': '', // Header gol - va fi titlul generat
    'intro': {
      target: 'constatare.tipConstatare',
      templates: {
        'Autoconstatare': 'În data de {data_procesare}, în jurul orei {ora_procesare}, în timp ce patrula în zona {zona_input}, echipajul de poliție a constatat că ',
        'autoconstatare': 'În data de {data_procesare}, în jurul orei {ora_procesare}, în timp ce patrula în zona {zona_input}, echipajul de poliție a constatat că ',
        'apel 112': 'În urma unui apel la linia de urgență 112, efectuat de către cetățeanul {nume_parte_vatamata} (CNP {cnp_parte_vatamata}), în data de {data_procesare}, la ora {ora_procesare}, echipajul de poliție a intervenit în zona {zona_input}, unde ',
        'focuri de armă': 'În urma alertelor sistemelor de supraveghere S.R.I. primite de autorități în data de {data_procesare} la ora {ora_procesare} cu privire la focuri de armă în zona {zona_input}, echipajele de poliție au intervenit și au neutralizat și imobilizat persoanele implicate. Printre acestea, ',
        'jaf': 'În data de {data_procesare}, la ora {ora_procesare}, alarma de securitate a {obiectiv_jaf} de pe {zona_input} a fost declanșată. Aflate în patrulă în apropiere, organele de poliție au intrevenit și au neutralizat făptașii. Printre aceștia, ',
        'furt auto': 'În data de {data_procesare}, la ora {ora_procesare}, a fost declanșată alarma unui vehicul în zona {zona_input}. Ajuns la fața locului, echipajul de poliție a constatat că ',
        'rutieră': 'În urma unui filtru de control rutier organizat de autorități pentru prevenirea și combaterea neconformităților participanților la traficul rutier și asigurarea siguranței rutiere conform reglementărilor în vigoare din Codul Penal, în data de {data_procesare}, la ora {ora_procesare}, în zona {zona_input}, s-a constatat că ',
        'mineriadă': 'În data de {data_procesare}, în jurul orei {ora_procesare} a avut loc o acțiune de tip "Mineriadă" a echipajelor de poliție. În urma controalelor, s-a descoperit că ',
        'razie': 'În urma unei razii S.A.S. ce a avut loc pe {zona_input} în data de {data_procesare}, la ora {ora_procesare}, au fost arestați mai mulți suspecți. Printre aceștia, '
      }
    }, // Tipul de constatare din secțiunea constatare - înlocuiește direct cu textul complet din șabloane
    'intro_autoconstatare': {
      target: 'constatare.tipConstatare',
      templates: {
        'autoconstatare': 'În data de {data_procesare}, în jurul orei {ora_procesare}, în timp ce patrula în zona {zona_input}, echipajul de poliție a constatat că '
      }
    }, // Forțare template autoconstatare când este selectat Auto Constatare
    'infraction_1_desc': 'incadrare.previzualizare1',
    'infraction_2_desc': 'incadrare.previzualizare2',
    'infraction_3_desc': 'incadrare.previzualizare3',
    'sanctions_block': '_special_sanctions_block_template',
    'sanctiuni_descriere': 'sanctiuni.descriere', // Placeholder pentru descrierea sancțiunilor - folosește conținutul din secțiunea sancțiuni
    'mentiuni_1': 'incadrare.mentiuni1',
    'mentiuni_2': 'incadrare.mentiuni2',
    'mentiuni_3': 'incadrare.mentiuni3',
    'AUTOSPECIALA_SELECT': 'vehicul.autospeciala',
    'nr_inmatriculare': {
      target: 'vehicul.numereInmatriculare',
      filled: 'cu numerele de înmatriculare {valoare}',
      empty: 'fără numere de înmatriculare'
    },
    // Mapări pentru placeholder-ii din template-urile intro
    'data_procesare': 'generale.data',
    'ora_procesare': 'generale.ora',
    'obiectiv_jaf': 'generale.obiectivJaf',
    'zona_input': 'generale.locatia',
    'nume_parte_vatamata': 'generale.numeParteVatamate',
    'cnp_parte_vatamata': 'generale.cnpParteVatamate',
    'nume': 'generale.numeSuspect',
    'cnp': 'generale.cnpSuspect',
    'CNP': 'generale.cnpSuspect', // Adăugat mapare pentru CNP majuscul
    
    // Mapări pentru vehicul
    'tipVehicul': 'vehicul.tipVehicul',
    'modelVehicul': 'vehicul.modelVehicul',
    'culoareVehicul': 'vehicul.culoareVehicul',
    'tip_vehicul_procesator': 'vehicul.tipVehicul',
    'model_vehicul_input': 'vehicul.modelVehicul',
    'culoare_vehicul': 'vehicul.culoareVehicul',
    
    // Mapări pentru constatare
    'viteza_inregistrata': 'generale.vitezaInregistrata',
    'limita_viteza_zona': 'generale.limitaViteza',
    'limita_viteza': 'generale.limitaViteza',
    
    // Mapări pentru perchezitie
    'perchezitie_buzunare_continut': 'constatare.buzunareText',
    'perchezitie_torpedo_continut': 'constatare.torpedoText', 
    'perchezitie_portbagaj_continut': 'constatare.portbagajText',
    'PERCHEZITIE_TEXT': 'PERCHEZITIE_TEXT', // Adăugat mapare pentru PERCHEZITIE_TEXT
    'PERCHEZITIE_TEXT': 'PERCHEZITIE_TEXT', // Adăugat mapare pentru PERCHEZITIE_TEXT
    'perchezitie_text': {
      target: 'constatare.perchezitie',
      filled: 'asupra sa au fost găsite obiecte interzise',
      empty: 'nu au fost găsite obiecte interzise'
    },
    '_special_licente_single': '{lipsa_licenta_1}, document necesar pentru desfășurarea activității în cauză.',
    '_special_licente_double': '{lipsa_licenta_1} și nici {lipsa_licenta_2}, ambele documente fiind necesare pentru desfășurarea activităților în cauză.',
    '_special_perchezitie_buzunare_filled': 'asupra sa avea {perchezitie_buzunare_continut}',
    '_special_perchezitie_buzunare_empty': 'asupra sa nu avea nimic ilegal.',
    '_special_perchezitie_torpedo_filled': 'în torpedo avea {perchezitie_torpedo_continut}',
    '_special_perchezitie_torpedo_empty': 'în torpedo nu avea nimic ilegal.',
    '_special_perchezitie_portbagaj_filled': 'în portbagaj avea {perchezitie_portbagaj_continut}',
    '_special_perchezitie_portbagaj_empty': 'în portbagaj nu avea nimic ilegal.',
    '_special_sanctions_block_template': '{amenda_aplicata_line}\n{arest_aplicat_line}\n{puncte_permis_line}\n{dosar_penal_line}\n{anulare_permis_line}\n{ridicare_vehicul_line}\n{perchezitie_line}',
    '_special_amenda_aplicata_line_template': 'Amendă Contravențională în valoare de {amanda_manuala} $',
    '_special_arest_aplicat_line_template': 'Închisoare timp de {arest_manual} luni, în Penitenciarul de maximă securitate Sandy',
    '_special_puncte_permis_line_template': 'Puncte penalizare permis {puncte_permis}',
    '_special_dosar_penal_line_template': 'Dosar Penal',
    '_special_anulare_permis_line_template': 'Anulare Permis',
    '_special_ridicare_vehicul_line_template': 'Ridicare vehicul',
    '_special_perchezitie_line_template': 'Percheziție'
  });
  
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [previewUpdateTrigger, setPreviewUpdateTrigger] = useState(0); // Trigger pentru actualizare previzualizări
  
  // Funcție helper pentru a accesa căi punctate (ex: 'descriereCaz.descriere')
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };
  
  // State for card positioning and sizing
  const [relativeDistance, setRelativeDistance] = useState(() => {
    // Încărcăm distanța relativă salvată din localStorage
    const saved = localStorage.getItem('mdtCardRelativeDistance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed || 0;
      } catch (e) {
        console.error('Error loading relative distance:', e);
      }
    }
    return 0;
  });
  
  const [cardPosition, setCardPosition] = useState(() => {
    // Încărcăm poziția salvată din localStorage
    const saved = localStorage.getItem('mdtCardPosition');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { x: parsed.x || 250, y: parsed.y || 100 };
      } catch (e) {
        console.error('Error loading card position:', e);
      }
    }
    return { x: 250, y: 100 };
  });
  
  const [cardSize, setCardSize] = useState(() => {
    // Încărcăm dimensiunea salvată din localStorage
    const saved = localStorage.getItem('mdtCardSize');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { width: parsed.width || 300, height: parsed.height || 80 };
      } catch (e) {
        console.error('Error loading card size:', e);
      }
    }
    return { width: 300, height: 80 };
  });
  const [isExpanded, setIsExpanded] = useState(true); // Starea de expansiune a cardului - mereu true
  const [showAllInfractions, setShowAllInfractions] = useState(false); // Starea pentru afișarea tuturor infracțiunilor
  const [isContentVisible, setIsContentVisible] = useState(true); // Starea pentru vizibilitatea conținutului cardului
  const [isDragging, setIsDragging] = useState(false); // Stare drag
  const [isResizing, setIsResizing] = useState(false); // Stare resize
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Offset pentru drag
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 }); // Poziția inițială a drag-ului
  const [isPotentialDrag, setIsPotentialDrag] = useState(false); // Flag pentru a distinge între click și drag
  const [resizeEdge, setResizeEdge] = useState(''); // Edge-ul pentru resize (right, bottom, corner)
  const [hasUserResized, setHasUserResized] = useState(false); // Flag dacă utilizatorul a redimensionat manual

  // Salvăm poziția, dimensiunea și starea de expansiune în localStorage
  useEffect(() => {
    localStorage.setItem('mdtCardPosition', JSON.stringify(cardPosition));
  }, [cardPosition]);

  // Salvăm distanța relativă față de sidebar în localStorage
  useEffect(() => {
    localStorage.setItem('mdtCardRelativeDistance', JSON.stringify(relativeDistance));
  }, [relativeDistance]);

  useEffect(() => {
    localStorage.setItem('mdtCardSize', JSON.stringify(cardSize));
  }, [cardSize]);

  useEffect(() => {
    localStorage.setItem('mdtCardExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Funcție pentru a calcula zona vizibilă exactă a paginii MDT
  const getVisiblePageBounds = useCallback(() => {
    const isSidebarCollapsed = !document.body.classList.contains('sidebar-open') && 
                              !document.querySelector('.main-content')?.classList.contains('sidebar-open') &&
                              window.innerWidth >= 768;
    
    
    // Marginile exacte ale componentelor
    const titleBarHeight = 60; // Înălțimea titlebar-ului
    const sidebarWidth = isSidebarCollapsed ? 0 : 250; // Lățimea sidebar-ului (0 dacă e colapsat)
    
    // Adăugăm margini personalizate
    const leftMargin = isSidebarCollapsed ? 20 : 20; // 20px indiferent de starea sidebar-ului
    const rightMargin = 20; // 20px de la marginea dreaptă a ferestrei
    const topMargin = 10; // 10px de la titlebar
    const bottomMargin = 20; // 20px de la marginea de jos
    
    // Zona vizibilă exactă a paginii MDT cu margini personalizate
    const bounds = {
      left: sidebarWidth + leftMargin,      // După sidebar + margine personalizată
      top: titleBarHeight + topMargin,      // Marginea de sus: după titlebar + margine
      right: window.innerWidth - rightMargin, // Marginea dreaptă: fereastră - marjă (fără +250)
      bottom: window.innerHeight - bottomMargin + 60, // Marginea de jos: fereastră - marjă + înălțime titlebar
      width: window.innerWidth - sidebarWidth - leftMargin - rightMargin, // Lățimea vizibilă (fără +250)
      height: window.innerHeight - titleBarHeight - topMargin - bottomMargin + 60 // Înălțimea vizibilă + înălțime titlebar
    };
    
      return bounds;
  }, []);

  // Funcție pentru a genera textul de percheziție combinat
  const generatePerchezitieText = useCallback((data) => {
    const perchezitii = [];
    
    // Buzunare
    if (data.constatare.buzunare) {
      if (data.constatare.buzunareText && data.constatare.buzunareText.trim() !== '') {
        perchezitii.push(`asupra sa avea ${data.constatare.buzunareText}`);
      } else {
        perchezitii.push('asupra sa nu avea nimic ilegal');
      }
    }
    
    // Torpedo
    if (data.constatare.torpedo) {
      if (data.constatare.torpedoText && data.constatare.torpedoText.trim() !== '') {
        perchezitii.push(`în torpedo avea ${data.constatare.torpedoText}`);
      } else {
        perchezitii.push('în torpedo nu avea nimic ilegal');
      }
    }
    
    // Portbagaj
    if (data.constatare.portbagaj) {
      if (data.constatare.portbagajText && data.constatare.portbagajText.trim() !== '') {
        perchezitii.push(`în portbagaj avea ${data.constatare.portbagajText}`);
      } else {
        perchezitii.push('în portbagaj nu avea nimic ilegal');
      }
    }
    
    // Combinăm textele cu "și" între penultimul și ultimul
    if (perchezitii.length === 0) {
      return '';
    } else if (perchezitii.length === 1) {
      return perchezitii[0];
    } else {
      const last = perchezitii.pop();
      return perchezitii.join(', ') + ' și ' + last;
    }
  }, []);

  // Funcție pentru înlocuirea placeholder-urilor cu logica exactă din aplicația veche
  const replacePlaceholders = useCallback((template, data) => {
    console.log('replacePlaceholders called with template:', template);
    console.log('replacePlaceholders called with data:', data);
    console.log('cardData structure:', JSON.stringify(data, null, 2));
    
    // Funcție recursivă pentru a înlocui toți placeholder-ii
    const processText = (text) => {
      if (!text || text.trim() === '') return '';
      return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
        // Caz special pentru perchezitie_text
        if (key === 'perchezitie_text') {
          return generatePerchezitieText(data);
        }
        
        // Caz special pentru numere_inmatriculare
        if (key === 'numere_inmatriculare') {
          const numere = getNestedValue(data, 'vehicul.numereInmatriculare');
          if (numere && numere.trim() !== '') {
            return `cu numerele de înmatriculare ${numere}`;
          } else {
            return 'fără numere de înmatriculare';
          }
        }
        
        // Verificăm dacă există mapare în compositePlaceholders
        const composite = compositePlaceholders[key];
        if (composite) {
          if (typeof composite === 'string') {
            // Dacă este un string (cale punctată), folosim getNestedValue
            if (composite.includes('.')) {
              const nestedValue = getNestedValue(data, composite);
              console.log('Processing inner placeholder (nested):', key, 'Path:', composite, 'Value:', nestedValue);
              
              // Aplicăm formatarea pentru data și data_procesare
              if (key === 'data' || key === 'data_procesare') {
                if (nestedValue && nestedValue.trim() !== '') {
                  // Convertim din format YYYY-MM-DD în ZZ.LL.AAAA
                  const date = new Date(nestedValue);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}.${month}.${year}`;
                } else {
                  const today = new Date();
                  const day = String(today.getDate()).padStart(2, '0');
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const year = today.getFullYear();
                  return `${day}.${month}.${year}`;
                }
              }
              
              return nestedValue || '';
            }
            // Altfel căutăm direct
            const value = data[composite] || '';
            console.log('Processing inner placeholder (direct):', key, 'Key:', composite, 'Value:', value);
            
            // Aplicăm formatarea pentru data și data_procesare
            if (key === 'data' || key === 'data_procesare') {
              if (value && value.trim() !== '') {
                // Convertim din format YYYY-MM-DD în ZZ.LL.AAAA
                const date = new Date(value);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}.${month}.${year}`;
              } else {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();
                return `${day}.${month}.${year}`;
              }
            }
            
            return value;
          }
          // Dacă este obiect, tratăm ca și composite placeholder
          const targetKey = composite.target || key;
          const value = getNestedValue(data, targetKey);
          console.log('Processing inner placeholder (composite):', key, 'Target:', targetKey, 'Value:', value);
          
          if (value !== undefined && value !== null && value !== '' && value !== false) {
            // Verificăm dacă există șabloane predefinite
            if (composite.templates) {
              const templateValue = composite.templates[value] || composite.templates[value.toLowerCase()];
              console.log('Using template for:', value, 'Template:', templateValue);
              
              // Procesăm placeholder-ii din template-ul intro folosind processText
              const processedTemplate = processText(templateValue);
              console.log('Processed intro template:', processedTemplate);
              return processedTemplate;
            }
            
            // Verificăm dacă există filled
            if (composite.filled) {
              console.log('DEBUG: Processing filled for key:', key, 'value:', value);
              const filled = composite.filled.replace(/\{valoare\}/g, value === true ? '' : value);
              console.log('Composite filled result:', filled);
              return filled;
            }
            
            return value;
          } else {
            // Verificăm dacă există empty
            if (composite.empty) {
              console.log('DEBUG: Processing empty for key:', key);
              console.log('Composite empty result:', composite.empty);
              return composite.empty;
            }
            
            return '';
          }
        }
        
        // Căutare directă în toate secțiunile
        let value = data[key] || getNestedValue(data, key);
        if (!value) value = data.generale[key];
        if (!value) value = data.vehicul[key];
        if (!value) value = data.constatare[key];
        if (!value) value = data.incadrare[key];
        if (!value) value = data.sanctiuni[key];
        if (!value) value = data.descriereCaz[key];
        
        console.log('Processing inner placeholder (fallback):', key, 'Value:', value);
        return value || '';
      });
    };
    
    if (!template) return '';
    const result = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
      console.log('Processing placeholder:', key);
      const composite = compositePlaceholders[key];
      
      // Verificăm dacă placeholder-ul este definit în compositePlaceholders
      if (composite) {
        // Dacă este un string direct (ex: 'incadrare.previzualizare1')
        if (typeof composite === 'string') {
          // Verificăm dacă este o cale punctată
          if (composite.includes('.')) {
            const nestedValue = getNestedValue(data, composite);
            console.log('Nested lookup for:', composite, 'Value:', nestedValue);
            
            // Procesăm recursiv placeholder-ii din textul obținut
            if (nestedValue && typeof nestedValue === 'string') {
              return processText(nestedValue);
            }
            return nestedValue !== undefined && nestedValue !== null && nestedValue !== '' && nestedValue !== false ? nestedValue : '';
          }
          
          // Recursiv: înlocuim placeholderii din string
          const innerResult = composite.replace(/\{([a-zA-Z0-9_]+)\}/g, (innerMatch, innerKey) => {
            const innerValue = data[innerKey];
            console.log('Inner placeholder:', innerKey, 'Value:', innerValue);
            return innerValue !== undefined && innerValue !== null && innerValue !== '' && innerValue !== false ? innerValue : '';
          });
          console.log('Composite string result:', innerResult);
          return innerResult;
        }
        
        // Dacă este un obiect cu target/filled/empty
        const targetKey = composite.target || key;
        const value = getNestedValue(data, targetKey);
        console.log('Placeholder:', key, 'Target:', targetKey, 'Value:', value);

        if (value !== undefined && value !== null && value !== '' && value !== false) {
          // Verificăm dacă există șabloane predefinite
          if (composite.templates) {
            const templateValue = composite.templates[value] || composite.templates[value.toLowerCase()];
            console.log('Using template for:', value, 'Template:', templateValue);
            
            // Procesăm placeholder-ii din template-ul intro folosind processText
            const processedTemplate = processText(templateValue);
            console.log('Processed intro template:', processedTemplate);
            return processedTemplate;
          }
          
          // Pentru intro, dacă nu există template, returnăm valoarea direct
          if (key === 'intro' || key === 'intro_autoconstatare') {
            return value;
          }
          
          if (composite.filled) {
            console.log('DEBUG: Processing filled for key:', key, 'value:', value);
            const filled = composite.filled.replace(/\{valoare\}/g, value === true ? '' : value);
            console.log('Composite filled result:', filled);
            return filled;
          }
          return value === true ? key : value;
        } else {
          if (composite.empty) {
            console.log('DEBUG: Processing empty for key:', key);
            console.log('Composite empty result:', composite.empty);
            return composite.empty;
          }
        }
      } else {
        // Căutare directă în data dacă nu e în compositePlaceholders
        const value = data[key];
        console.log('Direct lookup for:', key, 'Value:', value);
        
        // Caz special pentru nr_inmatriculare
        if (key === 'nr_inmatriculare') {
          if (value && value.trim() !== '') {
            return `cu numerele ${value}`;
          } else {
            return 'fără numere de înmatriculare';
          }
        }
        
        // Caz special pentru data - format ZZ.LL.AAAA
        if (key === 'data') {
          if (value && value.trim() !== '') {
            // Convertim din format YYYY-MM-DD în ZZ.LL.AAAA
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
          } else {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            return `${day}.${month}.${year}`;
          }
        }
        
        // Caz special pentru data_procesare - format ZZ.LL.AAAA
        if (key === 'data_procesare') {
          if (value && value.trim() !== '') {
            // Convertim din format YYYY-MM-DD în ZZ.LL.AAAA
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
          } else {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            return `${day}.${month}.${year}`;
          }
        }
        
        // Caz special pentru perchezitie_buzunare_continut
        if (key === 'perchezitie_buzunare_continut') {
          if (value && value.trim() !== '') {
            return value;
          } else {
            return 'COMPLETEAZĂ LA BUZUNARE';
          }
        }
        
        // Caz special pentru perchezitie_torpedo_continut
        if (key === 'perchezitie_torpedo_continut') {
          if (value && value.trim() !== '') {
            return value;
          } else {
            return 'COMPLETEAZĂ LA TORPEDO';
          }
        }
        
        // Caz special pentru perchezitie_portbagaj_continut
        if (key === 'perchezitie_portbagaj_continut') {
          if (value && value.trim() !== '') {
            return value;
          } else {
            return 'COMPLETEAZĂ LA PORTBAGAJ';
          }
        }
        
        // Caz special pentru PERCHEZITIE_TEXT - combină textele din checkbox-urile bifate
        if (key === 'PERCHEZITIE_TEXT') {
          const buzunareChecked = data.constatare && data.constatare.buzunare;
          const torpedoChecked = data.constatare && data.constatare.torpedo;
          const portbagajChecked = data.constatare && data.constatare.portbagaj;
          
          const perchezitieTexts = [];
          
          // Buzunare
          if (buzunareChecked) {
            const buzunareContinut = data.constatare.buzunareText;
            if (buzunareContinut && buzunareContinut.trim() !== '') {
              perchezitieTexts.push(`asupra sa avea ${buzunareContinut}`);
            } else {
              perchezitieTexts.push('asupra sa nu avea nimic ilegal');
            }
          }
          
          // Torpedo
          if (torpedoChecked) {
            const torpedoContinut = data.constatare.torpedoText;
            if (torpedoContinut && torpedoContinut.trim() !== '') {
              perchezitieTexts.push(`în torpedo avea ${torpedoContinut}`);
            } else {
              perchezitieTexts.push('în torpedo nu avea nimic ilegal');
            }
          }
          
          // Portbagaj
          if (portbagajChecked) {
            const portbagajContinut = data.constatare.portbagajText;
            if (portbagajContinut && portbagajContinut.trim() !== '') {
              perchezitieTexts.push(`în portbagaj avea ${portbagajContinut}`);
            } else {
              perchezitieTexts.push('în portbagaj nu avea nimic ilegal');
            }
          }
          
          if (perchezitieTexts.length > 0) {
            // Combinăm textele cu "și " între ele
            return perchezitieTexts.join(' și ');
          } else {
            // Niciun checkbox bifat - mesaj de atenționare
            return 'EFECTUEAZĂ PERCHEZIȚIA!';
          }
        }
        
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          // Caz special pentru data_procesare - format ZZ.LL.AAAA
          if (key === 'data_procesare') {
            if (value && value.trim() !== '') {
              // Convertim din format YYYY-MM-DD în ZZ.LL.AAAA
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}.${month}.${year}`;
            } else {
              const today = new Date();
              const day = String(today.getDate()).padStart(2, '0');
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const year = today.getFullYear();
              return `${day}.${month}.${year}`;
            }
          }
          
          // Caz special pentru data - format ZZ.LL.AAAA
          if (key === 'data') {
            if (value && value.trim() !== '') {
              // Convertim din format YYYY-MM-DD în ZZ.LL.AAAA
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}.${month}.${year}`;
            } else {
              const today = new Date();
              const day = String(today.getDate()).padStart(2, '0');
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const year = today.getFullYear();
              return `${day}.${month}.${year}`;
            }
          }
          
          return value;
        }
      }
      
      console.log('Placeholder replaced with empty string');
      return ''; // Return empty string instead of placeholder
    });
    
    console.log('Final result:', result);
    return result;
  }, [compositePlaceholders, generatePerchezitieText]);
  
  // Funcție pentru generarea descrierii
  const generateDescription = useCallback(() => {
    console.log('generateDescription called');
    console.log('cardData.incadrare:', cardData.incadrare);
    
    // Verificăm dacă masterTemplate este gol și îl resetăm
    if (!masterTemplate || masterTemplate.trim() === '') {
      const defaultTemplate = `{header}{intro_autoconstatare}{infraction_1_desc}{mentiuni_1}{infraction_2_desc}{mentiuni_2}{infraction_3_desc}{mentiuni_3}\n{sanctiuni_descriere}`;
      console.log('masterTemplate was empty, resetting to:', defaultTemplate);
      setMasterTemplate(defaultTemplate);
      return; // Ieșim pentru a permite rerender-ul cu template-ul nou
    }
    
    // Extragem infracțiunile selectate
    const infractiuni = [];
    
    if (cardData.incadrare.infractiune1 && cardData.incadrare.infractiune1.trim() !== '') {
      console.log('Processing infractiune1:', cardData.incadrare.infractiune1);
      const capMatch = cardData.incadrare.infractiune1.match(/Cap\.?\s*(\d+)/);
      const artMatch = cardData.incadrare.infractiune1.match(/Art\.?\s*(\d+)\.(\d+)/);
      console.log('infractiune1 matches:', capMatch, artMatch);
      if (capMatch && artMatch) {
        infractiuni.push({
          cap: parseInt(capMatch[1]),
          art: parseInt(artMatch[1]) * 1000 + parseInt(artMatch[2]),
          text: cardData.incadrare.infractiune1
        });
      }
    }
    
    if (cardData.incadrare.infractiune2 && cardData.incadrare.infractiune2.trim() !== '') {
      console.log('Processing infractiune2:', cardData.incadrare.infractiune2);
      const capMatch = cardData.incadrare.infractiune2.match(/Cap\.?\s*(\d+)/);
      const artMatch = cardData.incadrare.infractiune2.match(/Art\.?\s*(\d+)\.(\d+)/);
      console.log('infractiune2 matches:', capMatch, artMatch);
      if (capMatch && artMatch) {
        infractiuni.push({
          cap: parseInt(capMatch[1]),
          art: parseInt(artMatch[1]) * 1000 + parseInt(artMatch[2]),
          text: cardData.incadrare.infractiune2
        });
      }
    }
    
    if (cardData.incadrare.infractiune3 && cardData.incadrare.infractiune3.trim() !== '') {
      console.log('Processing infractiune3:', cardData.incadrare.infractiune3);
      const capMatch = cardData.incadrare.infractiune3.match(/Cap\.?\s*(\d+)/);
      const artMatch = cardData.incadrare.infractiune3.match(/Art\.?\s*(\d+)\.(\d+)/);
      console.log('infractiune3 matches:', capMatch, artMatch);
      if (capMatch && artMatch) {
        infractiuni.push({
          cap: parseInt(capMatch[1]),
          art: parseInt(artMatch[1]) * 1000 + parseInt(artMatch[2]),
          text: cardData.incadrare.infractiune3
        });
      }
    }
    
    console.log('infractiuni array:', infractiuni);
    
    // Sortăm infracțiunile după numărul articolului (cea mai gravă prima)
    infractiuni.sort((a, b) => {
      // Extragem numărul articolului pentru sortare corectă
      const getArtNumber = (text) => {
        const match = text.match(/Art\.?\s*(\d+)\.(\d+)/);
        if (match) {
          return parseInt(match[1]) * 1000 + parseInt(match[2]); // Art. 4.3 = 4003, Art. 1.1 = 1001
        }
        return 0;
      };
      
      return getArtNumber(b.text) - getArtNumber(a.text);
    });
    
    console.log('sorted infractiuni:', infractiuni);
    
    // Generăm titlul în formatul cerut
    let title = '';
    if (infractiuni.length > 0) {
      // Extragem doar numele infracțiunilor (fără "Cap. X - Art. Y.Z - ")
      const numeInfractiuni = infractiuni.map(i => {
        const match = i.text.match(/Cap\.?\s*\d+\s*[-–]\s*Art\.?\s*\d+(?:\.\d+)?\s*[-–]\s*(.+)/);
        return match ? match[1].trim() : i.text;
      });
      const capitolCeaMaiGrava = infractiuni[0].cap;
      
      if (numeInfractiuni.length === 1) {
        title = `${numeInfractiuni[0]} | Cap. ${capitolCeaMaiGrava}`;
      } else if (numeInfractiuni.length === 2) {
        title = `${numeInfractiuni[0]}, ${numeInfractiuni[1]} | Cap. ${capitolCeaMaiGrava}`;
      } else {
        title = `${numeInfractiuni[0]}, ${numeInfractiuni[1]}, ${numeInfractiuni[2]} | Cap. ${capitolCeaMaiGrava}`;
      }
    } else {
      // Fără infracțiuni - titlu gol
      title = '';
    }
    
    console.log('generated title:', title);
    
    // Generăm descrierea folosind template-ul dinamic
    const dynamicTemplate = generateDynamicTemplate(cardData);
    console.log('Using dynamic template:', dynamicTemplate);
    const description = replacePlaceholders(dynamicTemplate, cardData);
    
    setGeneratedDescription(description);
    setGeneratedTitle(title);
    
    // Salvăm și în cardData.descriereCaz pentru funcțiile de copiere
    // Asigurăm că înlocuim conținutul existent, nu adăugăm
    updateCardData('descriereCaz', 'titlu', title);
    updateCardData('descriereCaz', 'descriere', description);
  }, [masterTemplate, cardData, replacePlaceholders, generateDynamicTemplate]);

  // Ajustăm poziția cardului când sidebar-ul se schimbă
  useEffect(() => {
    const bounds = getVisiblePageBounds();
    const expectedX = bounds.left + relativeDistance;
    
    // Validăm poziția în zona vizibilă
    const maxX = bounds.right - cardSize.width; // Cardul nu poate depăși marginea dreaptă
    const minX = bounds.left;                   // Cardul nu poate trece de sidebar + margine
    const validX = Math.max(minX, Math.min(expectedX, maxX));
    
    const validY = Math.max(bounds.top, Math.min(cardPosition.y, bounds.bottom - cardSize.height));
    
    // Actualizăm doar dacă poziția este diferită semnificativ
    if (Math.abs(cardPosition.x - validX) > 5 || Math.abs(cardPosition.y - validY) > 5) {
      setCardPosition(prev => ({
        x: validX,
        y: validY
      }));
    }
  }, [relativeDistance, cardPosition, cardSize, getVisiblePageBounds]);

  // Actualizare rezultate căutare
  useEffect(() => {
    if (searchTerm && !isLoading) {
      // Resetăm showAllInfractions când începem căutarea
      if (showAllInfractions) {
        setShowAllInfractions(false);
      }
      
      const results = filterCodPenal(searchTerm);
      setSearchResults(results.slice(0, 10)); // Limităm la 10 rezultate
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, isLoading, showAllInfractions, databaseData.codPenal]);

  // Funcție pentru a comuta starea de expansiune - dezactivată
  const toggleExpanded = () => {
    // setIsExpanded(!isExpanded); // Cardul rămâne mereu extins
  };

  // Funcție pentru a afișa toate infracțiunile
  const showAllInfractionsList = () => {
    setShowAllInfractions(true);
    setSearchTerm(''); // Resetăm căutarea
    setSelectedResultId(null); // Deselectăm orice rezultat
  };

  // Funcție pentru a reveni la modul de căutare
  const backToSearch = () => {
    setShowAllInfractions(false);
    setSearchResults([]);
  };

  // Funcție pentru afișare detalii
  const showItemDetails = (item, type) => {
    setSelectedResultId(item.id);
    setDetailItem(item);
    setDetailType(type);
    // Nu mai deschidem popup, doar afișăm detaliile în card
  };

  // Funcție pentru închidere popup
  const closeDetailPopup = () => {
    setShowDetailPopup(false);
    setDetailItem(null);
    setDetailType('');
  };

  // Funcție pentru a deselecta rezultatul
  const deselectResult = () => {
    setSelectedResultId(null);
    setDetailItem(null);
    setDetailType('');
  };

  // Funcție pentru a comuta vizibilitatea conținutului (dublu-click)
  const handleLabelDoubleClick = (e) => {
    e.stopPropagation(); // Prevenim propagarea la drag
    setIsContentVisible(!isContentVisible);
  };

  // Funcții pentru drag and drop
  const handleMouseDown = (e) => {
    // Verifică dacă click-ul este pe input sau pe elemente interactive
    if (e.target.closest('.search-input') || 
        e.target.closest('.search-clear-button') || 
        e.target.closest('.search-results-scrollable') ||
        e.target.closest('.result-item') ||
        e.target.closest('.result-details')) {
      return; // Nu iniția drag pe elemente interactive
    }
    
    // Verifică dacă click-ul este pe textul "Caută infracțiune"
    if (e.target.closest('.search-label')) {
      // Setăm poziția inițială pentru drag imediat
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setIsPotentialDrag(true);
      
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      // Nu prevenim default - permite click-ul normal pe label
      return;
    }
    
    // Pentru alte zone ale header-ului, inițiem drag imediat
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  // Funcții pentru resize
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Resize start'); // Debug
    
    // Determinăm ce edge este tras
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    
    let edge = '';
    if (e.target.classList.contains('resize-right')) {
      edge = 'right';
    } else if (e.target.classList.contains('resize-bottom')) {
      edge = 'bottom';
    } else if (e.target.classList.contains('resize-corner')) {
      edge = 'corner';
    }
    
    console.log('Resize edge:', edge); // Debug
    setResizeEdge(edge);
    setIsResizing(true);
    
    // Setăm offset-ul corect pentru resize
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
  };


const handleMouseMove = useCallback((e) => {
  // Verificăm dacă este un drag potențial din label
  if (isPotentialDrag && !isDragging) {
    const deltaX = Math.abs(e.clientX - dragStartPos.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.y);
    
    // Dacă mouse-ul s-a mișcat mai mult de 5px, inițiem drag
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
      setIsPotentialDrag(false);
    }
  }
  
  if (isDragging) {
    // Obținem zona vizibilă exactă a paginii MDT
    const bounds = getVisiblePageBounds();
    
    // Calculăm poziția validă în zona vizibilă
    const maxX = bounds.right - cardSize.width;  // Cardul nu poate depăși marginea dreaptă
    const maxY = bounds.bottom - cardSize.height; // Cardul nu poate depăși marginea de jos
    const minX = bounds.left;                     // Cardul nu poate trece de sidebar
    const minY = bounds.top;                      // Cardul nu poate trece de titlebar
    
    // Asigurăm că cardul nu iese niciodată în stânga de 0 (marginea ferestrei)
    const actualMinX = Math.max(0, minX);
    
    const newX = Math.max(actualMinX, Math.min(e.clientX - dragOffset.x, maxX));
    const newY = Math.max(minY, Math.min(e.clientY - dragOffset.y, maxY));
    
    setCardPosition({
      x: newX,
      y: newY
    });
    
    // Actualizăm distanța relativă față de sidebar
    const sidebarWidth = bounds.left - (bounds.left === 20 ? 0 : 20); // Ajustăm pentru marginea personalizată
    if (newX >= bounds.left) {
      setRelativeDistance(newX - bounds.left);
    } else if (sidebarWidth === 0) {
      // Când sidebar e colapsat, distanța e de la marginea stângă
      setRelativeDistance(newX);
    }
  } else if (isResizing) {
    setCardSize(prevSize => {
      let newWidth = prevSize.width;
      let newHeight = prevSize.height;
      const bounds = getVisiblePageBounds();
      
      if (resizeEdge.includes('right')) {
        newWidth = Math.max(250, Math.min(bounds.right - cardPosition.x, e.clientX - cardPosition.x));
      }
      if (resizeEdge.includes('bottom')) {
        newHeight = Math.max(200, Math.min(bounds.bottom - cardPosition.y, e.clientY - cardPosition.y));
      }
      if (resizeEdge.includes('corner')) {
        newWidth = Math.max(250, Math.min(bounds.right - cardPosition.x, e.clientX - cardPosition.x));
        newHeight = Math.max(200, Math.min(bounds.bottom - cardPosition.y, e.clientY - cardPosition.y));
      }
      
      return { width: newWidth, height: newHeight };
      });
    }
  }, [isDragging, isResizing, isPotentialDrag, dragOffset, cardPosition, resizeEdge, getVisiblePageBounds, dragStartPos]);

  const handleMouseUp = useCallback(() => {
    // Resetăm stările de drag
    setIsDragging(false);
    setIsPotentialDrag(false);
    setIsResizing(false);
    setResizeEdge('');
  }, []);

  // Adăugăm MutationObserver pentru a detecta schimbările sidebar-ului proactiv
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' && 
             (mutation.target.classList.contains('sidebar-open') || 
              mutation.target.classList.contains('main-content')))) {
          
          // Obținem zona vizibilă actuală
          const bounds = getVisiblePageBounds();
          
          // Verificăm dacă cardul ar fi în conflict cu sidebar-ul extins
          if (bounds.left > 20 && cardPosition.x < bounds.left) {
            // Mutăm cardul exact la marginea personalizată a sidebar-ului
            const newX = bounds.left;
            setCardPosition(prev => ({ ...prev, x: newX }));
            setRelativeDistance(0);
          }
        }
      });
    });
    
    // Observăm schimbările pe main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      observer.observe(mainContent, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    
    // Observăm și body pentru orice schimbări
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [cardPosition.x, getVisiblePageBounds]);

  // Adăugăm event listener pentru redimensionarea ferestrei
  useEffect(() => {
    const handleWindowResize = () => {
      // Obținem zona vizibilă actuală
      const bounds = getVisiblePageBounds();
      
      // Verificăm dacă cardul iese din zona vizibilă după redimensionare
      const maxX = bounds.right - cardSize.width;
      const maxY = bounds.bottom - cardSize.height;
      const minX = bounds.left;
      const minY = bounds.top;
      
      // Asigurăm că cardul nu iese niciodată în stânga de 0 (marginea ferestrei)
      const actualMinX = Math.max(0, minX);
      
      let needsAdjustment = false;
      let newX = cardPosition.x;
      let newY = cardPosition.y;
      
      // Ajustăm X dacă iese din zona vizibilă
      if (cardPosition.x > maxX) {
        newX = maxX;
        needsAdjustment = true;
      } else if (cardPosition.x < actualMinX) {
        newX = actualMinX;
        needsAdjustment = true;
      }
      
      // Ajustăm Y dacă iese din zona vizibilă
      if (cardPosition.y > maxY) {
        newY = maxY;
        needsAdjustment = true;
      } else if (cardPosition.y < minY) {
        newY = minY;
        needsAdjustment = true;
      }
      
      if (needsAdjustment) {
        setCardPosition({ x: newX, y: newY });
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [cardPosition, cardSize, getVisiblePageBounds]);

  // Adăugăm event listener pentru click în afara cardului
  useEffect(() => {
    const handleClickOutside = (e) => {
      const card = document.querySelector('.floating-card');
      if (card && !card.contains(e.target)) {
        // Click în afara cardului - ascundem lista completă
        setShowAllInfractions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Adaugă event listeners pentru mouse move și mouse up
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Funcții pentru gestionarea cardurilor detaliabile
  const updateCardData = (section, field, value) => {
    setCardData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Funcție helper pentru a determina clasa CSS în funcție de valoarea câmpului
  const getInputClassName = (value) => {
    // Verificăm dacă valoarea este goală, false, undefined sau conține doar whitespace
    const isEmpty = value === undefined || value === null || !value || value === '' || value === false || (typeof value === 'string' && value.trim() === '');
    return isEmpty ? 'detail-input empty' : 'detail-input filled';
  };

  // Handlers pentru autocomplete locație
  const handleLocationSearch = (term) => {
    setLocationSearchTerm(term);
    
    // Dacă ștergem complet textul, ștergem și limita de viteză
    if (term.length === 0) {
      updateCardData('generale', 'limitaViteza', '');
    }
    
    if (term.length < 2) {
      // Afișăm toate locațiile când câmpul este gol sau are puține caractere
      const limitaVitezaData = databaseData?.limiteViteza || [];
      const allResults = [];
      
      limitaVitezaData.forEach((location) => {
        if (location.name) {
          allResults.push({
            id: location.id || location.name,
            strada: location.name,
            localitate: '', // Old app doesn't have localitate
            limita: location.limit || ''
          });
        }
      });
      
      setLocationSearchResults(allResults);
      setShowLocationDropdown(allResults.length > 0);
      return;
    }
    
    const limitaVitezaData = databaseData?.limiteViteza || [];
    const results = [];
    
    limitaVitezaData.forEach((location) => {
      if (location.name && location.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          id: location.id || location.name,
          strada: location.name,
          localitate: '', // Old app doesn't have localitate
          limita: location.limit || ''
        });
      }
    });
    
    setLocationSearchResults(results);
    setShowLocationDropdown(results.length > 0);
  };
  
  const handleLocationSelect = (location) => {
    const locationText = location.strada + (location.localitate ? `, ${location.localitate}` : '');
    updateCardData('generale', 'locatia', locationText);
    setLocationSearchTerm(locationText);
    setSelectedLocationId(location.id);
    setShowLocationDropdown(false);
    
    // Actualizăm și limita de viteză dacă există
    if (location.limita) {
      updateCardData('generale', 'limitaViteza', location.limita.toString());
    }
  };
  
  const handleLocationBlur = () => {
    // Ascundem dropdown-ul după o scurtă întârziere
    setTimeout(() => {
      setShowLocationDropdown(false);
    }, 200);
  };
  
  const handleLocationFocus = () => {
    // Afișăm toate locațiile la focus
    const limitaVitezaData = databaseData?.limiteViteza || [];
    const allResults = [];
    
    limitaVitezaData.forEach((location) => {
      if (location.name) {
        allResults.push({
          id: location.id || location.name,
          strada: location.name,
          localitate: '', // Old app doesn't have localitate
          limita: location.limit || ''
        });
      }
    });
    
    setLocationSearchResults(allResults);
    setShowLocationDropdown(allResults.length > 0);
  };
  
  // Handlers pentru Infracțiune 1
  const handleInfractiune1Search = (term) => {
    setInfractiune1SearchTerm(term);
    
    if (term.length < 2) {
      // Afișăm toate articolele când câmpul este gol sau are puține caractere
      setInfractiune1SearchResults(databaseData.codPenal);
      setShowInfractiune1Dropdown(databaseData.codPenal.length > 0);
      return;
    }
    
    const results = filterCodPenal(term);
    setInfractiune1SearchResults(results);
    setShowInfractiune1Dropdown(results.length > 0);
  };
  
  const handleInfractiune1Select = (articol) => {
    const infractiuneText = `${articol.cap} - Art. ${articol.numarArticol} - ${articol.titlu}`;
    updateCardData('incadrare', 'infractiune1', infractiuneText);
    // Setăm template-ul curat, nu procesat
    updateCardData('incadrare', 'previzualizare1', articol.descriere1);
    setInfractiune1SearchTerm(infractiuneText);
    setSelectedInfractiune1Id(articol.id);
    setShowInfractiune1Dropdown(false);
  };

  const handleInfractiune1Clear = () => {
    updateCardData('incadrare', 'infractiune1', '');
    updateCardData('incadrare', 'previzualizare1', '');
    setInfractiune1SearchTerm('');
    setSelectedInfractiune1Id(null);
    setShowInfractiune1Dropdown(false);
  };
  
  const handleInfractiune1Blur = () => {
    setTimeout(() => {
      setShowInfractiune1Dropdown(false);
    }, 200);
  };
  
  const handleInfractiune1Focus = () => {
    // Afișăm toate articolele la focus
    setInfractiune1SearchResults(databaseData.codPenal);
    setShowInfractiune1Dropdown(databaseData.codPenal.length > 0);
  };
  
  // Handlers pentru Infracțiune 2
  const handleInfractiune2Search = (term) => {
    setInfractiune2SearchTerm(term);
    
    if (term.length < 2) {
      // Afișăm toate articolele când câmpul este gol sau are puține caractere
      setInfractiune2SearchResults(databaseData.codPenal);
      setShowInfractiune2Dropdown(databaseData.codPenal.length > 0);
      return;
    }
    
    const results = filterCodPenal(term);
    setInfractiune2SearchResults(results);
    setShowInfractiune2Dropdown(results.length > 0);
  };
  
  const handleInfractiune2Select = (articol) => {
    const infractiuneText = `${articol.cap} - Art. ${articol.numarArticol} - ${articol.titlu}`;
    updateCardData('incadrare', 'infractiune2', infractiuneText);
    // Setăm template-ul curat, nu procesat
    updateCardData('incadrare', 'previzualizare2', articol.descriere2);
    setInfractiune2SearchTerm(infractiuneText);
    setSelectedInfractiune2Id(articol.id);
    setShowInfractiune2Dropdown(false);
  };

  const handleInfractiune2Clear = () => {
    updateCardData('incadrare', 'infractiune2', '');
    updateCardData('incadrare', 'previzualizare2', '');
    setInfractiune2SearchTerm('');
    setSelectedInfractiune2Id(null);
    setShowInfractiune2Dropdown(false);
  };
  
  const handleInfractiune2Blur = () => {
    setTimeout(() => {
      setShowInfractiune2Dropdown(false);
    }, 200);
  };
  
  const handleInfractiune2Focus = () => {
    // Afișăm toate articolele la focus
    setInfractiune2SearchResults(databaseData.codPenal);
    setShowInfractiune2Dropdown(databaseData.codPenal.length > 0);
  };
  
  // Handlers pentru Infracțiune 3
  const handleInfractiune3Search = (term) => {
    setInfractiune3SearchTerm(term);
    
    if (term.length < 2) {
      // Afișăm toate articolele când câmpul este gol sau are puține caractere
      setInfractiune3SearchResults(databaseData.codPenal);
      setShowInfractiune3Dropdown(databaseData.codPenal.length > 0);
      return;
    }
    
    const results = filterCodPenal(term);
    setInfractiune3SearchResults(results);
    setShowInfractiune3Dropdown(results.length > 0);
  };
  
  const handleInfractiune3Select = (articol) => {
    const infractiuneText = `${articol.cap} - Art. ${articol.numarArticol} - ${articol.titlu}`;
    updateCardData('incadrare', 'infractiune3', infractiuneText);
    // Setăm template-ul curat, nu procesat
    updateCardData('incadrare', 'previzualizare3', articol.descriere3);
    setInfractiune3SearchTerm(infractiuneText);
    setSelectedInfractiune3Id(articol.id);
    setShowInfractiune3Dropdown(false);
  };

  const handleInfractiune3Clear = () => {
    updateCardData('incadrare', 'infractiune3', '');
    updateCardData('incadrare', 'previzualizare3', '');
    setInfractiune3SearchTerm('');
    setSelectedInfractiune3Id(null);
    setShowInfractiune3Dropdown(false);
  };
  
  const handleInfractiune3Blur = () => {
    setTimeout(() => {
      setShowInfractiune3Dropdown(false);
    }, 200);
  };
  
  const handleInfractiune3Focus = () => {
    // Afișăm toate articolele la focus
    setInfractiune3SearchResults(databaseData.codPenal);
    setShowInfractiune3Dropdown(databaseData.codPenal.length > 0);
  };

  // Funcții pentru autocomplete tip vehicul
  const handleVehicleTypeSearch = (term) => {
    setVehicleTypeSearchTerm(term);
    
    if (term.length < 2) {
      setVehicleTypeSearchResults([]);
      setShowVehicleTypeDropdown(false);
      return;
    }
    
    // Căutăm în vehicule din baza de date
    const vehiculeData = databaseData?.vehicule || [];
    const results = [];
    const uniqueTypes = new Set();
    
    vehiculeData.forEach((vehicle) => {
      if (vehicle.type && vehicle.type.toLowerCase().includes(term.toLowerCase())) {
        if (!uniqueTypes.has(vehicle.type)) {
          uniqueTypes.add(vehicle.type);
          results.push({
            id: vehicle.type,
            type: vehicle.type
          });
        }
      }
    });
    
    setVehicleTypeSearchResults(results);
    setShowVehicleTypeDropdown(results.length > 0);
  };
  
  const handleVehicleTypeSelect = (vehicleType) => {
    updateCardData('vehicul', 'tipVehicul', vehicleType.type);
    setVehicleTypeSearchTerm(vehicleType.type);
    setSelectedVehicleTypeId(vehicleType.id);
    setShowVehicleTypeDropdown(false);
  };
  
  const handleVehicleTypeBlur = () => {
    setTimeout(() => {
      setShowVehicleTypeDropdown(false);
    }, 200);
  };
  
  const handleVehicleTypeFocus = () => {
    if (vehicleTypeSearchTerm.length === 0 || vehicleTypeSearchResults.length === 0) {
      const vehiculeData = databaseData?.vehicule || [];
      const allResults = [];
      const uniqueTypes = new Set();
      
      vehiculeData.forEach((vehicle) => {
        if (vehicle.type && !uniqueTypes.has(vehicle.type)) {
          uniqueTypes.add(vehicle.type);
          allResults.push({
            id: vehicle.type,
            type: vehicle.type
          });
        }
      });
      
      setVehicleTypeSearchResults(allResults);
      setShowVehicleTypeDropdown(true);
    } else if (vehicleTypeSearchTerm.length >= 2 && vehicleTypeSearchResults.length > 0) {
      setShowVehicleTypeDropdown(true);
    }
  };

  // Funcții pentru autocomplete model vehicul
  const handleVehicleModelSearch = (term) => {
    setVehicleModelSearchTerm(term);
    
    if (term.length < 2) {
      // Afișăm toate modelele când câmpul este gol sau are puține caractere
      const vehiculeData = databaseData?.vehicule || [];
      const results = [];
      const uniqueModels = new Set();
      
      vehiculeData.forEach((vehicle) => {
        if (vehicle.name && !uniqueModels.has(vehicle.name)) {
          uniqueModels.add(vehicle.name);
          results.push({
            id: vehicle.name,
            name: vehicle.name,
            type: vehicle.type || 'Unknown'
          });
        }
      });
      
      setVehicleModelSearchResults(results);
      setShowVehicleModelDropdown(results.length > 0);
      return;
    }
    
    // Căutăm în vehicule din baza de date
    const vehiculeData = databaseData?.vehicule || [];
    const results = [];
    const uniqueModels = new Set();
    
    vehiculeData.forEach((vehicle) => {
      if (vehicle.name && vehicle.name.toLowerCase().includes(term.toLowerCase())) {
        if (!uniqueModels.has(vehicle.name)) {
          uniqueModels.add(vehicle.name);
          results.push({
            id: vehicle.name,
            name: vehicle.name,
            type: vehicle.type || 'Unknown'
          });
        }
      }
    });
    
    setVehicleModelSearchResults(results);
    setShowVehicleModelDropdown(results.length > 0);
  };
  
  const handleVehicleModelSelect = (vehicleModel) => {
    updateCardData('vehicul', 'modelVehicul', vehicleModel.name);
    setVehicleModelSearchTerm(vehicleModel.name);
    setSelectedVehicleModelId(vehicleModel.id);
    setShowVehicleModelDropdown(false);
  };
  
  const handleVehicleModelBlur = () => {
    setTimeout(() => {
      setShowVehicleModelDropdown(false);
    }, 200);
  };
  
  const handleVehicleModelFocus = () => {
    if (vehicleModelSearchTerm.length === 0 || vehicleModelSearchResults.length === 0) {
      const vehiculeData = databaseData?.vehicule || [];
      const allResults = [];
      const uniqueModels = new Set();
      
      vehiculeData.forEach((vehicle) => {
        if (vehicle.name && !uniqueModels.has(vehicle.name)) {
          uniqueModels.add(vehicle.name);
          allResults.push({
            id: vehicle.name,
            name: vehicle.name,
            type: vehicle.type || 'Unknown'
          });
        }
      });
      
      setVehicleModelSearchResults(allResults);
      setShowVehicleModelDropdown(true);
    }
  };

  // Funcții pentru autocomplete documente
  const documenteOptions = [
    'Buletin',
    'Permis de Conducere',
    'Licență de minerit',
    'Licență de pescar',
    'Licență de tractat',
    'Licență de transport',
    'Licență de navigat',
    'Licență de pilot',
    'Licență tăietor lemne',
    'Licență de crescător de tabac',
    'Licență de port-armă'
  ];

  const handleDocument1Search = (term) => {
    setDocument1SearchTerm(term);
    
    if (term.length < 1) {
      // Afișăm toate documentele când câmpul este gol
      const allResults = documenteOptions.map((document, index) => ({
        id: index,
        name: document
      }));
      setDocument1SearchResults(allResults);
      setShowDocument1Dropdown(true);
      return;
    }
    
    // Căutăm în lista de documente
    const results = documenteOptions
      .filter(document => document.toLowerCase().includes(term.toLowerCase()))
      .map((document, index) => ({
        id: index,
        name: document
      }));
    
    setDocument1SearchResults(results);
    setShowDocument1Dropdown(results.length > 0);
  };

  const handleDocument1Select = (document) => {
    setDocument1SearchTerm(document.name);
    setSelectedDocument1Id(document.id);
    updateCardData('constatare', 'documentLipsa1', document.name);
    setShowDocument1Dropdown(false);
  };

  const handleDocument1Focus = () => {
    if (document1SearchTerm.length === 0 || document1SearchResults.length === 0) {
      const allResults = documenteOptions.map((document, index) => ({
        id: index,
        name: document
      }));
      setDocument1SearchResults(allResults);
      setShowDocument1Dropdown(true);
    }
  };

  const handleDocument1Blur = () => {
    setTimeout(() => setShowDocument1Dropdown(false), 200);
  };

  const handleDocument2Search = (term) => {
    setDocument2SearchTerm(term);
    
    if (term.length < 1) {
      // Afișăm toate documentele când câmpul este gol
      const allResults = documenteOptions.map((document, index) => ({
        id: index,
        name: document
      }));
      setDocument2SearchResults(allResults);
      setShowDocument2Dropdown(true);
      return;
    }
    
    // Căutăm în lista de documente
    const results = documenteOptions
      .filter(document => document.toLowerCase().includes(term.toLowerCase()))
      .map((document, index) => ({
        id: index,
        name: document
      }));
    
    setDocument2SearchResults(results);
    setShowDocument2Dropdown(results.length > 0);
  };

  const handleDocument2Select = (document) => {
    setDocument2SearchTerm(document.name);
    setSelectedDocument2Id(document.id);
    updateCardData('constatare', 'documentLipsa2', document.name);
    setShowDocument2Dropdown(false);
  };

  const handleDocument2Focus = () => {
    if (document2SearchTerm.length === 0 || document2SearchResults.length === 0) {
      const allResults = documenteOptions.map((document, index) => ({
        id: index,
        name: document
      }));
      setDocument2SearchResults(allResults);
      setShowDocument2Dropdown(true);
    }
  };

  const handleDocument2Blur = () => {
    setTimeout(() => setShowDocument2Dropdown(false), 200);
  };

  // Funcții pentru autocomplete autospecială
  const autospecialaOptions = [
    'autospeciala de poliție',
    'autospeciala S.M.U.R.D.',
    'blindata S.A.S.'
  ];

  const handleAutospecialaSearch = (term) => {
    setAutospecialaSearchTerm(term);
    
    if (term.length < 1) {
      // Afișăm toate autospecialele când câmpul este gol
      const allResults = autospecialaOptions.map((autospeciala, index) => ({
        id: index,
        name: autospeciala
      }));
      setAutospecialaSearchResults(allResults);
      setShowAutospecialaDropdown(true);
      return;
    }
    
    // Căutăm în lista de autospeciale
    const results = autospecialaOptions
      .filter(autospeciala => autospeciala.toLowerCase().includes(term.toLowerCase()))
      .map((autospeciala, index) => ({
        id: index,
        name: autospeciala
      }));
    
    setAutospecialaSearchResults(results);
    setShowAutospecialaDropdown(results.length > 0);
  };

  const handleAutospecialaSelect = (autospeciala) => {
    setAutospecialaSearchTerm(autospeciala.name);
    setSelectedAutospecialaId(autospeciala.id);
    updateCardData('vehicul', 'autospeciala', autospeciala.name);
    setShowAutospecialaDropdown(false);
  };

  const handleAutospecialaFocus = () => {
    if (autospecialaSearchTerm.length === 0 || autospecialaSearchResults.length === 0) {
      const allResults = autospecialaOptions.map((autospeciala, index) => ({
        id: index,
        name: autospeciala
      }));
      setAutospecialaSearchResults(allResults);
      setShowAutospecialaDropdown(true);
    }
  };

  const handleAutospecialaBlur = () => {
    setTimeout(() => setShowAutospecialaDropdown(false), 200);
  };

  // Actualizare manuală a datei și orei - fără refresh automat
  // Folosim doar butonul manual pentru actualizare
  useEffect(() => {
    // Actualizăm doar la montare pentru a avea data curentă
    const { date, time } = getCurrentDateTime();
    updateCardData('generale', 'data', date);
    updateCardData('generale', 'ora', time);
  }, []); // Array gol pentru a rula doar la montare

  // Funcție pentru generarea template-urilor dinamice pe baza descrierilor
  const generatePreviewTemplate = (descriere) => {
    if (!descriere) return '';
    
    // Returnăm template-ul direct, fără procesare inline
    // Lăsăm procesarea placeholderilor la processPreviewTemplate
    return descriere;
  };

  // Funcție pentru procesarea template-urilor de previzualizare
  const processPreviewTemplate = (template, cardData, infractiuneKey) => {
    // Verificăm dacă există infracțiune selectată pentru acest câmp de previzualizare
    const infractiuneField = `infractiune${infractiuneKey}`;
    const hasInfractiune = cardData.incadrare[infractiuneField] && cardData.incadrare[infractiuneField].trim() !== '';
    
    // Dacă nu există infracțiune selectată, afișăm un mesaj informativ
    if (!hasInfractiune) {
      return `<span style="color: rgba(255, 255, 255, 0.5); font-style: italic;">Selectați o infracțiune pentru a vedea previzualizarea</span>`;
    }
    
    if (!template || template.trim() === '') return '';
    
    // Forțăm re-randarea prin includerea trigger-ului
    const forceUpdate = previewUpdateTrigger;
    
    // Mapping pentru placeholderii scurți
    const placeholderMapping = {
      // Generale
      'nume': 'generale.numeSuspect',
      'cnp': 'generale.cnpSuspect',
      'CNP': 'generale.cnpSuspect', // Adăugat mapare pentru CNP majuscul
      'data': 'generale.data',
      'ora': 'generale.ora',
      'locatia': 'generale.locatia',
      'obiectiv_jaf': 'generale.obiectivJaf',
      'nume_parte_vatamata': 'numeParteVatamate',
      'cnp_parte_vatamata': 'cnpParteVatamate',
      
      // Vehicul
      'tipVehicul': 'vehicul.tipVehicul',
      'modelVehicul': 'vehicul.modelVehicul',
      'culoareVehicul': 'vehicul.culoareVehicul',
      'nr_inmatriculare': 'vehicul.numereInmatriculare',
      'AUTOSPECIALA_SELECT': 'vehicul.autospeciala',
      'autospeciala_select': 'vehicul.autospeciala',
      'tip_vehicul_procesator': 'vehicul.tipVehicul',
      'model_vehicul_input': 'vehicul.modelVehicul',
      'culoare_vehicul': 'vehicul.culoareVehicul',
      
      // Constatare
      'viteza_inregistrata': 'generale.vitezaInregistrata',
      'limita_viteza_zona': 'generale.limitaViteza',
      'limita_viteza': 'generale.limitaViteza',
      
      // Incadrare (pentru consistență)
      'infractiune1': 'incadrare.infractiune1',
      'previzualizare1': 'incadrare.previzualizare1',
      'mentiuni1': 'incadrare.mentiuni1',
      'infractiune2': 'incadrare.infractiune2',
      'previzualizare2': 'incadrare.previzualizare2',
      'mentiuni2': 'incadrare.mentiuni2',
      'infractiune3': 'incadrare.infractiune3',
      'previzualizare3': 'incadrare.previzualizare3',
      'mentiuni3': 'incadrare.mentiuni3',
      
      // Sancțiuni
      'amenda_totala': 'sanctiuni.amendaTotala',
      'amenda': 'sanctiuni.amendaManuala',
      'arest_total': 'sanctiuni.arestTotal',
      'arest': 'sanctiuni.arestManual',
      'puncte_permis': 'sanctiuni.punctePermis',
      'puncte': 'sanctiuni.punctePermis',
      'anulare_permis': 'sanctiuni.anularePermis',
      'dosar_penal': 'sanctiuni.dosarPenal',
      'ridicare_vehicul': 'sanctiuni.ridicareVehicul',
      'locatie_detentie': 'sanctiuni.locatieDetentie',
      
      // Descriere Caz
      'titlu_caz': 'descriereCaz.titlu',
      'descriere_caz': 'descriereCaz.descriere',
      
      // Perchezitie
      'perchezitie_buzunare_continut': 'constatare.buzunareText',
      'perchezitie_torpedo_continut': 'constatare.torpedoText', 
      'perchezitie_portbagaj_continut': 'constatare.portbagajText',
      'PERCHEZITIE_TEXT': 'PERCHEZITIE_TEXT', // Adăugat mapare pentru PERCHEZITIE_TEXT
      'perchezitie_text': 'PERCHEZITIE_TEXT' // Mapare pentru perchezitie_text (mic) către logica PERCHEZITIE_TEXT
    };
    
    let processedTemplate = template;
    
    // Procesăm fiecare placeholder din template
    const placeholders = processedTemplate.match(/\{([^}]+)\}/g);
    
    if (placeholders) {
      placeholders.forEach(placeholder => {
        const key = placeholder.replace(/[{}]/g, '');
        
        // Verificăm dacă avem mapare directă
        if (placeholderMapping[key]) {
          const path = placeholderMapping[key];
          const value = getNestedValue(cardData, path);
          
          if (value && value.trim() !== '') {
            // Caz special pentru AUTOSPECIALA_SELECT
            if (key === 'AUTOSPECIALA_SELECT') {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
            } else if (key === 'nr_inmatriculare') {
              const displayValue = `cu numerele ${value}`;
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${displayValue}</span>`);
            } else if (key === 'viteza_inregistrata') {
              // Caz special pentru viteza_inregistrata - afișăm doar valoarea
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
            } else if (key === 'perchezitie_buzunare_continut') {
              // Caz special pentru perchezitie_buzunare_continut - simplificat
              if (value && value.trim() !== '') {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA BUZUNARE</span>`);
              }
            } else if (key === 'perchezitie_torpedo_continut') {
              // Caz special pentru perchezitie_torpedo_continut - simplificat
              if (value && value.trim() !== '') {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA TORPEDO</span>`);
              }
            } else if (key === 'perchezitie_portbagaj_continut') {
              // Caz special pentru perchezitie_portbagaj_continut - simplificat
              if (value && value.trim() !== '') {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA PORTBAGAJ</span>`);
              }
            } else {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
            }
          } else {
            // Caz special pentru nr_inmatriculare gol
            if (key === 'nr_inmatriculare') {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">fără numere de înmatriculare</span>`);
            } else if (key === 'AUTOSPECIALA_SELECT') {
              // Caz special pentru AUTOSPECIALA_SELECT gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE AUTOSPECIALA!</span>`);
            } else if (key === 'culoare_vehicul') {
              // Caz special pentru culoare_vehicul gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CULOAREA!</span>`);
            } else if (key === 'nume') {
              // Caz special pentru nume gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ NUMELE!</span>`);
            } else if (key === 'cnp') {
              // Caz special pentru cnp gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CNP-UL!</span>`);
            } else if (key === 'tip_vehicul_procesator') {
              // Caz special pentru tip_vehicul_procesator gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE TIPUL VEHICULULUI!</span>`);
            } else if (key === 'model_vehicul_input') {
              // Caz special pentru model_vehicul_input gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE MODELUL VEHICULULUI!</span>`);
            } else if (key === 'AUTOSPECIALA_SELECT') {
              // Caz special pentru AUTOSPECIALA_SELECT
              if (value && value.trim() !== '') {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE AUTOSPECIALA!</span>`);
              }
            } else if (key === 'licente_text') {
              // Caz special pentru licente_text gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LICENȚA LIPSĂ!</span>`);
            } else if (key === 'nume_parte_vatamata') {
              // Caz special pentru nume_parte_vatamata gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ NUMELE VICTIMEI!</span>`);
            } else if (key === 'cnp_parte_vatamata') {
              // Caz special pentru cnp_parte_vatamata gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CNP-UL VICTIMEI!</span>`);
            } else if (key === 'zona_input') {
              // Caz special pentru zona_input gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE STRADA!</span>`);
            } else if (key === 'limita_viteza_zona') {
              // Caz special pentru limita_viteza_zona gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE STRADA PENTRU A VEDEA LIMITA DE VITEZĂ!</span>`);
            } else if (key === 'cantitate_substanta') {
              // Caz special pentru cantitate_substanta gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ SUBSTANȚA SUB INFLUENȚĂ!</span>`);
            } else if (key === 'tip_substanta') {
              // Caz special pentru tip_substanta gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ REZULTATUL TESTULUI!</span>`);
            } else if (key === 'cantitate_droguri_mare_risc') {
              // Caz special pentru cantitate_droguri_mare_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CANTITATE DROGURI MARE RISC!</span>`);
            } else if (key === 'droguri_mare_risc') {
              // Caz special pentru droguri_mare_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ DROGURI DE MARE RISC!</span>`);
            } else if (key === 'droguri_risc') {
              // Caz special pentru droguri_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ DROGURI DE RISC!</span>`);
            } else if (key === 'cantitate_droguri_risc') {
              // Caz special pentru cantitate_droguri_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CANTITATE DROGURI DE RISC!</span>`);
            } else if (key === 'cantitate_tigari') {
              // Caz special pentru cantitate_tigari gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ NUMĂRUL DE ȚIGĂRI!</span>`);
            } else if (key === 'cantitate_bani') {
              // Caz special pentru cantitate_bani gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ SUMA BANI MURDARI/NEMARCAȚI!</span>`);
            } else if (key === 'viteza_inregistrata') {
              // Caz special pentru viteza_inregistrata gol - mesaj de atenționare
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">AI UITAT SĂ COMPLETEZI VITEZA ÎNREGISTRATĂ</span>`);
            } else if (key === 'perchezitie_buzunare_continut') {
              // Caz special pentru perchezitie_buzunare_continut gol - simplificat
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA BUZUNARE</span>`);
            } else if (key === 'perchezitie_torpedo_continut') {
              // Caz special pentru perchezitie_torpedo_continut gol - simplificat
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA TORPEDO</span>`);
            } else if (key === 'perchezitie_portbagaj_continut') {
              // Caz special pentru perchezitie_portbagaj_continut gol - simplificat
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA PORTBAGAJ</span>`);
            } else if (key === 'PERCHEZITIE_TEXT' || key === 'perchezitie_text') {
              // Caz special pentru PERCHEZITIE_TEXT - combină toate textele din checkbox-urile bifate
              const buzunareChecked = getNestedValue(cardData, 'constatare.buzunare');
              const torpedoChecked = getNestedValue(cardData, 'constatare.torpedo');
              const portbagajChecked = getNestedValue(cardData, 'constatare.portbagaj');
              
              const perchezitieTexts = [];
              
              // Buzunare
              if (buzunareChecked) {
                const buzunareContinut = getNestedValue(cardData, 'constatare.buzunareText');
                if (buzunareContinut && buzunareContinut.trim() !== '') {
                  perchezitieTexts.push(`asupra sa avea ${buzunareContinut}`);
                } else {
                  perchezitieTexts.push('asupra sa nu avea nimic ilegal');
                }
              }
              
              // Torpedo
              if (torpedoChecked) {
                const torpedoContinut = getNestedValue(cardData, 'constatare.torpedoText');
                if (torpedoContinut && torpedoContinut.trim() !== '') {
                  perchezitieTexts.push(`în torpedo avea ${torpedoContinut}`);
                } else {
                  perchezitieTexts.push('în torpedo nu avea nimic ilegal');
                }
              }
              
              // Portbagaj
              if (portbagajChecked) {
                const portbagajContinut = getNestedValue(cardData, 'constatare.portbagajText');
                if (portbagajContinut && portbagajContinut.trim() !== '') {
                  perchezitieTexts.push(`în portbagaj avea ${portbagajContinut}`);
                } else {
                  perchezitieTexts.push('în portbagaj nu avea nimic ilegal');
                }
              }
              
              if (perchezitieTexts.length > 0) {
                // Combinăm textele cu "și " între ele
                const combinedText = perchezitieTexts.join(' și ');
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${combinedText}</span>`);
              } else {
                // Niciun checkbox bifat - mesaj de atenționare
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">EFECTUEAZĂ PERCHEZIȚIA!</span>`);
              }
            } else {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">${placeholder.toUpperCase()}</span>`);
            }
          }
        } else {
              // Căutare directă în cardData
              const directValue = getNestedValue(cardData, key);
              
              if (directValue && directValue.trim() !== '') {
                // Caz special pentru AUTOSPECIALA_SELECT
                if (key === 'AUTOSPECIALA_SELECT') {
                  processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${directValue}</span>`);
                } else if (key === 'nr_inmatriculare') {
                  const displayValue = `cu numerele ${directValue}`;
                  processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${displayValue}</span>`);
                } else if (key === 'viteza_inregistrata') {
              // Caz special pentru viteza_inregistrata - afișăm doar valoarea
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${directValue}</span>`);
            } else if (key === 'perchezitie_buzunare_continut') {
              // Caz special pentru perchezitie_buzunare_continut
              const buzunareChecked = getNestedValue(cardData, 'constatare.buzunare');
              if (buzunareChecked) {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">asupra sa avea ${directValue}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">${placeholder.toUpperCase()}</span>`);
              }
            } else if (key === 'perchezitie_torpedo_continut') {
              // Caz special pentru perchezitie_torpedo_continut
              const torpedoChecked = getNestedValue(cardData, 'constatare.torpedo');
              if (torpedoChecked) {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">în torpedo avea ${directValue}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">${placeholder.toUpperCase()}</span>`);
              }
            } else if (key === 'perchezitie_portbagaj_continut') {
              // Caz special pentru perchezitie_portbagaj_continut
              const portbagajChecked = getNestedValue(cardData, 'constatare.portbagaj');
              if (portbagajChecked) {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">în portbagaj avea ${directValue}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">${placeholder.toUpperCase()}</span>`);
              }
            } else {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${directValue}</span>`);
            }
          } else {
            // Caz special pentru nr_inmatriculare gol
            if (key === 'nr_inmatriculare') {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">fără numere de înmatriculare</span>`);
            } else if (key === 'AUTOSPECIALA_SELECT') {
              // Caz special pentru AUTOSPECIALA_SELECT gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE AUTOSPECIALA!</span>`);
            } else if (key === 'culoare_vehicul') {
              // Caz special pentru culoare_vehicul gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CULOAREA!</span>`);
            } else if (key === 'nume') {
              // Caz special pentru nume gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ NUMELE!</span>`);
            } else if (key === 'cnp') {
              // Caz special pentru cnp gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CNP-UL!</span>`);
            } else if (key === 'tip_vehicul_procesator') {
              // Caz special pentru tip_vehicul_procesator gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE TIPUL VEHICULULUI!</span>`);
            } else if (key === 'model_vehicul_input') {
              // Caz special pentru model_vehicul_input gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE MODELUL VEHICULULUI!</span>`);
            } else if (key === 'AUTOSPECIALA_SELECT') {
              // Caz special pentru AUTOSPECIALA_SELECT
              if (value && value.trim() !== '') {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${value}</span>`);
              } else {
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE AUTOSPECIALA!</span>`);
              }
            } else if (key === 'licente_text') {
              // Caz special pentru licente_text gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LICENȚA LIPSĂ!</span>`);
            } else if (key === 'nume_parte_vatamata') {
              // Caz special pentru nume_parte_vatamata gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ NUMELE VICTIMEI!</span>`);
            } else if (key === 'cnp_parte_vatamata') {
              // Caz special pentru cnp_parte_vatamata gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CNP-UL VICTIMEI!</span>`);
            } else if (key === 'zona_input') {
              // Caz special pentru zona_input gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE STRADA!</span>`);
            } else if (key === 'limita_viteza_zona') {
              // Caz special pentru limita_viteza_zona gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">ALEGE STRADA PENTRU A VEDEA LIMITA DE VITEZĂ!</span>`);
            } else if (key === 'cantitate_substanta') {
              // Caz special pentru cantitate_substanta gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ SUBSTANȚA SUB INFLUENȚĂ!</span>`);
            } else if (key === 'tip_substanta') {
              // Caz special pentru tip_substanta gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ REZULTATUL TESTULUI!</span>`);
            } else if (key === 'cantitate_droguri_mare_risc') {
              // Caz special pentru cantitate_droguri_mare_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CANTITATE DROGURI MARE RISC!</span>`);
            } else if (key === 'droguri_mare_risc') {
              // Caz special pentru droguri_mare_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ DROGURI DE MARE RISC!</span>`);
            } else if (key === 'droguri_risc') {
              // Caz special pentru droguri_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ DROGURI DE RISC!</span>`);
            } else if (key === 'cantitate_droguri_risc') {
              // Caz special pentru cantitate_droguri_risc gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ CANTITATE DROGURI DE RISC!</span>`);
            } else if (key === 'cantitate_tigari') {
              // Caz special pentru cantitate_tigari gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ NUMĂRUL DE ȚIGĂRI!</span>`);
            } else if (key === 'cantitate_bani') {
              // Caz special pentru cantitate_bani gol
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ SUMA BANI MURDARI/NEMARCAȚI!</span>`);
            } else if (key === 'viteza_inregistrata') {
              // Caz special pentru viteza_inregistrata gol - mesaj de atenționare
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">AI UITAT SĂ COMPLETEZI VITEZA ÎNREGISTRATĂ</span>`);
            } else if (key === 'perchezitie_buzunare_continut') {
              // Caz special pentru perchezitie_buzunare_continut gol - simplificat
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA BUZUNARE</span>`);
            } else if (key === 'perchezitie_torpedo_continut') {
              // Caz special pentru perchezitie_torpedo_continut gol - simplificat
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA TORPEDO</span>`);
            } else if (key === 'perchezitie_portbagaj_continut') {
              // Caz special pentru perchezitie_portbagaj_continut gol - simplificat
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">COMPLETEAZĂ LA PORTBAGAJ</span>`);
            } else if (key === 'PERCHEZITIE_TEXT' || key === 'perchezitie_text') {
              // Caz special pentru PERCHEZITIE_TEXT - combină toate textele din checkbox-urile bifate
              const buzunareChecked = getNestedValue(cardData, 'constatare.buzunare');
              const torpedoChecked = getNestedValue(cardData, 'constatare.torpedo');
              const portbagajChecked = getNestedValue(cardData, 'constatare.portbagaj');
              
              const perchezitieTexts = [];
              
              // Buzunare
              if (buzunareChecked) {
                const buzunareContinut = getNestedValue(cardData, 'constatare.buzunareText');
                if (buzunareContinut && buzunareContinut.trim() !== '') {
                  perchezitieTexts.push(`asupra sa avea ${buzunareContinut}`);
                } else {
                  perchezitieTexts.push('asupra sa nu avea nimic ilegal');
                }
              }
              
              // Torpedo
              if (torpedoChecked) {
                const torpedoContinut = getNestedValue(cardData, 'constatare.torpedoText');
                if (torpedoContinut && torpedoContinut.trim() !== '') {
                  perchezitieTexts.push(`în torpedo avea ${torpedoContinut}`);
                } else {
                  perchezitieTexts.push('în torpedo nu avea nimic ilegal');
                }
              }
              
              // Portbagaj
              if (portbagajChecked) {
                const portbagajContinut = getNestedValue(cardData, 'constatare.portbagajText');
                if (portbagajContinut && portbagajContinut.trim() !== '') {
                  perchezitieTexts.push(`în portbagaj avea ${portbagajContinut}`);
                } else {
                  perchezitieTexts.push('în portbagaj nu avea nimic ilegal');
                }
              }
              
              if (perchezitieTexts.length > 0) {
                // Combinăm textele cu "și " între ele
                const combinedText = perchezitieTexts.join(' și ');
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-data">${combinedText}</span>`);
              } else {
                // Niciun checkbox bifat - mesaj de atenționare
                processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">EFECTUEAZĂ PERCHEZIȚIA!</span>`);
              }
            } else {
              processedTemplate = processedTemplate.replace(placeholder, `<span class="preview-placeholder">${placeholder.toUpperCase()}</span>`);
            }
          }
        }
      });
    }
    
    return processedTemplate;
  };

  // Efect pentru actualizarea instantanee a previzualizărilor
  useEffect(() => {
    // Forțăm re-randarea previzualizărilor imediat, fără delay
    setPreviewUpdateTrigger(prev => prev + 1);
  }, [
    cardData.generale, 
    cardData.vehicul, 
    cardData.constatare, 
    cardData.incadrare,
    cardData.sanctiuni,
    cardData.descriereCaz
  ]); // Monitorizăm toate secțiunile pentru actualizare instantanee

  // Funcții pentru cardul Sancțiuni & Descriere Caz
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        // Opțional: afișăm un mesaj de confirmare
        console.log('Text copiat în clipboard!');
      }).catch(err => {
        console.error('Eroare la copiere:', err);
        // Fallback: selectăm textul
        fallbackCopyTextToClipboard(text);
      });
    } else {
      // Fallback pentru browsere vechi
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Text copiat în clipboard!');
    } catch (err) {
      console.error('Eroare la copiere:', err);
    }
    
    document.body.removeChild(textArea);
  };

  const resetForm = () => {
    // Obținem data și ora curentă
    const currentDateTime = getCurrentDateTime();
    
    // Resetăm toate câmpurile din card, dar păstrăm data și ora actualizate
    setCardData({
      generale: {
        numeSuspect: '',
        cnpSuspect: '',
        sexSuspect: 'masculin',
        suspectComplice: false,
        numeParteVatamate: '',
        cnpParteVatamate: '',
        cnpParteVatamataType: '',
        sexVictima: 'masculin',
        victimaPolitie: false,
        locatia: '',
        dataOra: currentDateTime.dateDisplay,
        data: currentDateTime.date,
        ora: currentDateTime.time,
        vitezaInregistrata: '',
        limitaViteza: '',
        patrula: '',
        obiectivJaf: ''
      },
      vehicul: {
        tipVehicul: '',
        modelVehicul: '',
        culoareVehicul: '',
        numereInmatriculare: '',
        autospeciala: ''
      },
      constatare: {
        tipConstatare: 'autoconstatare',
        substantaSubInfluenta: '',
        tipSubstanta: '',
        rezultatTest: '',
        perchezitie: false,
        buzunare: false,
        buzunareText: '',
        buzunareContinut: '',
        torpedo: false,
        torpedoText: '',
        torpedoContinut: '',
        portbagaj: false,
        portbagajText: '',
        portbagajContinut: '',
        crimaOrganizata: false,
        tigariContrabanda: '',
        droguriRisc: '',
        droguriRiscCantitate: '',
        droguriMareRisc: '',
        droguriMareRiscCantitate: '',
        baniMurdari: '',
        licente: false,
        licenteCheckbox: false,
        lipsaLicenta1: '',
        lipsaLicenta2: ''
      },
      incadrare: {
        infractiune1: '',
        previzualizare1: 'cetățeanul {nume} ({cnp}) avea în posesie {perchezitie_buzunare_continut}, {perchezitie_torpedo_continut}, {perchezitie_portbagaj_continut}, fapt ilegal',
        mentiuni1: '',
        infractiune2: '',
        previzualizare2: 'cetățeanul {nume} ({cnp}) conducea {tipVehicul}, marca {modelVehicul} de culoare {culoareVehicul}, {nr_inmatriculare}, folosind telefonul mobil în timpul condusului.',
        mentiuni2: '',
        infractiune3: '',
        previzualizare3: 'cetățeanul {nume} ({cnp}) conducea {tipVehicul}, marca {modelVehicul} de culoare {culoareVehicul}, {nr_inmatriculare}, folosind telefonul mobil în timpul condusului.',
        mentiuni3: ''
      },
      sanctiuni: {
        amendaTotala: '',
        amendaManuala: '',
        arestTotal: '',
        arestManual: '',
        punctePermis: '',
        anularePermis: false,
        dosarPenal: false,
        perchezitie: false,
        ridicareVehicul: false,
        locatieDetentie: 'Penitenciarul LS'
      },
      descriereCaz: {
        titlu: '',
        descriere: ''
      }
    });
    
    // Resetăm toate câmpurile de search
    setSearchTerm('');
    setSearchResults([]);
    setSelectedResultId(null);
    
    // Resetăm search pentru locație
    setLocationSearchTerm('');
    setLocationSearchResults([]);
    setShowLocationDropdown(false);
    setSelectedLocationId(null);
    
    // Resetăm search pentru infracțiuni
    setInfractiune1SearchTerm('');
    setInfractiune1SearchResults([]);
    setShowInfractiune1Dropdown(false);
    setSelectedInfractiune1Id(null);
    
    setInfractiune2SearchTerm('');
    setInfractiune2SearchResults([]);
    setShowInfractiune2Dropdown(false);
    setSelectedInfractiune2Id(null);
    
    setInfractiune3SearchTerm('');
    setInfractiune3SearchResults([]);
    setShowInfractiune3Dropdown(false);
    setSelectedInfractiune3Id(null);
    
    // Resetăm search pentru vehicule
    setVehicleTypeSearchTerm('');
    setVehicleTypeSearchResults([]);
    setShowVehicleTypeDropdown(false);
    setSelectedVehicleTypeId(null);
    
    setVehicleModelSearchTerm('');
    setVehicleModelSearchResults([]);
    setShowVehicleModelDropdown(false);
    setSelectedVehicleModelId(null);
    
    // Resetăm search pentru documente
    setDocument1SearchTerm('');
    setDocument1SearchResults([]);
    setShowDocument1Dropdown(false);
    setSelectedDocument1Id(null);
    
    setDocument2SearchTerm('');
    setDocument2SearchResults([]);
    setShowDocument2Dropdown(false);
    setSelectedDocument2Id(null);
    
    // Resetăm search pentru autospecială
    setAutospecialaSearchTerm('');
    setAutospecialaSearchResults([]);
    setShowAutospecialaDropdown(false);
    setSelectedAutospecialaId(null);
    
    // Resetăm secțiunile toggle
    setShowSubstanteSection(false);
    setShowPerchezitieSection(false);
    setShowCrimaOrganizataSection(false);
    setShowLicenteSection(false);
    
    // Resetăm popup-urile
    setShowDetailPopup(false);
    setDetailItem(null);
    setDetailType('');
    
    // Resetăm rezultatele generate
    setGeneratedDescription('');
    setGeneratedTitle('');
    
    // Resetăm stările de vizibilitate
    setShowAllInfractions(false);
    setIsContentVisible(true);
  };

  // Calculează numărul de carduri deschise pentru layout
  const getOpenCardsCount = () => {
    return Object.values(openCards).filter(Boolean).length;
  };

  // Calculează clasa CSS pentru layout în funcție de numărul de carduri deschise
  const getCardsLayoutClass = () => {
    const count = getOpenCardsCount();
    if (count === 0) return 'no-cards';
    if (count === 1) return 'one-card';
    if (count === 2) return 'two-cards';
    return 'three-cards'; // 3+ carduri
  };

  // Funcție pentru a obține data și ora actuală (România)
  const getCurrentDateTime = () => {
    const now = new Date();
    // Creăm o dată în fusul orar al României (Europe/Bucharest)
    const romaniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
    
    // Formatăm data ca DD.MM.YYYY pentru afișare
    const day = String(romaniaTime.getDate()).padStart(2, '0');
    const month = String(romaniaTime.getMonth() + 1).padStart(2, '0');
    const year = romaniaTime.getFullYear();
    const dateDisplay = `${day}.${month}.${year}`; // DD.MM.YYYY
    
    // Păstrăm formatul YYYY-MM-DD pentru input-ul de tip date
    const dateInput = romaniaTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = romaniaTime.toTimeString().slice(0, 5); // HH:MM format 24h
    
    return { date: dateInput, time, dateDisplay };
  };

  // Funcție pentru a extrage sancțiunile aplicate unei infracțiuni
  const getSancțiuniForInfracțiune = (infracțiuneText) => {
    if (!infracțiuneText || infracțiuneText.trim() === '') {
      return [];
    }

    const sancțiuni = [];
    
    // Verificăm dacă baza de date este disponibilă
    if (!databaseData || !databaseData.codPenal || !Array.isArray(databaseData.codPenal)) {
      return sancțiuni;
    }
    
    // Extragem titlul din textul infracțiunii
    const titleMatch = infracțiuneText.match(/Art\.?\s*\d+\.?\d*\s*-\s*(.+)$/);
    const title = titleMatch ? titleMatch[1].trim() : infracțiuneText.trim();
    
    // Căutăm infracțiunea în baza de date după titlu
    const infracțiune = databaseData.codPenal.find(item => 
      item && item.titlu && 
      item.titlu.trim() === title
    );
    
    if (!infracțiune) {
      return sancțiuni;
    }
    
    // Adăugăm arest
    if (infracțiune.arestPeViata) {
      sancțiuni.push('Arest pe viață');
    } else if (infracțiune.arestMin !== undefined && infracțiune.arestMin !== null && infracțiune.arestMin > 0 && 
        infracțiune.arestMax !== undefined && infracțiune.arestMax !== null && infracțiune.arestMax > 0) {
      sancțiuni.push(`${infracțiune.arestMin} - ${infracțiune.arestMax} luni`);
    } else if (infracțiune.arestMin !== undefined && infracțiune.arestMin !== null && infracțiune.arestMin > 0) {
      sancțiuni.push(`${infracțiune.arestMin} luni`);
    } else if (infracțiune.arestMax !== undefined && infracțiune.arestMax !== null && infracțiune.arestMax > 0) {
      sancțiuni.push(`${infracțiune.arestMax} luni`);
    }
    
    // Adăugăm amendă
    if (infracțiune.amendaMin && infracțiune.amendaMax && 
        (infracțiune.amendaMin > 0 || infracțiune.amendaMax > 0)) {
      if (infracțiune.amendaMin === infracțiune.amendaMax) {
        sancțiuni.push(`${infracțiune.amendaMin} $`);
      } else {
        sancțiuni.push(`${infracțiune.amendaMin} - ${infracțiune.amendaMax} $`);
      }
    }
    
    // Adăugăm puncte permis
    if (infracțiune.punctePermis && infracțiune.punctePermis > 0) {
      sancțiuni.push(`${infracțiune.punctePermis} puncte`);
    }
    
    // Adăugăm sancțiuni booleene (doar dacă sunt true)
    if (infracțiune.anularePermis) {
      sancțiuni.push('Anulare Permis');
    }
    
    if (infracțiune.perchezitie) {
      sancțiuni.push('Percheziție');
    }
    
    if (infracțiune.ridicareVehicul) {
      sancțiuni.push('Ridicare Vehicul');
    }
    
    if (infracțiune.dosarPenal) {
      sancțiuni.push('Dosar Penal');
    }
    
    return sancțiuni;
  };

  // Funcție pentru verificarea incompatibilităților între infracțiuni
  const checkIncompatibilitati = useCallback(() => {
    const infractiuniSelectate = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ].filter(infractiune => infractiune && infractiune.trim() !== '');
    
    // Verificăm doar dacă avem cel puțin 2 infracțiuni
    if (infractiuniSelectate.length < 2) {
      return { areIncompatibilitati: false, mesaje: [] };
    }
    
    const incompatibilitatiGasite = [];
    
    // Verificăm fiecare pereche de infracțiuni folosind ID-urile
    for (let i = 0; i < infractiuniSelectate.length; i++) {
      for (let j = 0; j < infractiuniSelectate.length; j++) {
        const infractiune1Text = infractiuniSelectate[i];
        const infractiune2Text = infractiuniSelectate[j];
        
        // Sărim aceeași poziție (i == j) pentru a nu verifica o infracțiune cu ea însăși
        if (i === j) continue;
        
        // Găsim ID-ul pentru prima infracțiune
        const infractiune1 = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiune1Text
        );
        
        // Găsim ID-ul pentru a doua infracțiune
        const infractiune2 = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiune2Text
        );
        
        if (infractiune1 && infractiune2) {
          const id1 = infractiune1.id;
          const id2 = infractiune2.id;
          
          // Verificăm dacă este aceeași infracțiune (duplicate)
          const esteAceeasiInfracțiune = infractiune1Text === infractiune2Text;
          
          // Verificăm dacă există incompatibilitate în ambele sensuri
          const incompatibilitate1to2 = infractiune1.incompatibilitati && 
            (infractiune1.incompatibilitati.includes(id2) || 
             infractiune1.incompatibilitati.includes(id2.replace('_vitezei_legale', '_legal')));
          
          const incompatibilitate2to1 = infractiune2.incompatibilitati && 
            (infractiune2.incompatibilitati.includes(id1) || 
             infractiune2.incompatibilitati.includes(id1.replace('_vitezei_legale', '_legal')));
          
          // Dacă există incompatibilitate în orice sens SAU este aceeași infracțiune (dar nu aceeași poziție)
          if ((incompatibilitate1to2 || incompatibilitate2to1) || esteAceeasiInfracțiune) {
            // Verificăm dacă nu am adăugat deja această combinație
            const existingCombo = incompatibilitatiGasite.find(item => 
              (item.infractiune1 === infractiune1Text && item.infractiune2 === infractiune2Text) ||
              (item.infractiune1 === infractiune2Text && item.infractiune2 === infractiune1Text)
            );
            
            if (!existingCombo) {
              incompatibilitatiGasite.push({
                infractiune1: infractiune1Text,
                infractiune2: infractiune2Text,
                motiv: esteAceeasiInfracțiune ? 'Duplicate - aceeași infracțiune selectată de mai multe ori' : 'Incompatibilitate nepermisă'
              });
            }
          }
        }
      }
    }
    
    return {
      areIncompatibilitati: incompatibilitatiGasite.length > 0,
      mesaje: incompatibilitatiGasite
    };
  }, [cardData.incadrare.infractiune1, cardData.incadrare.infractiune2, cardData.incadrare.infractiune3, databaseData]);

  // Funcție pentru copiere titlu în clipboard
  const copyTitleToClipboard = useCallback(() => {
    console.log('DEBUG: Încercare copiere titlu:', cardData.descriereCaz?.titlu);
    if (cardData.descriereCaz?.titlu && cardData.descriereCaz.titlu.trim() !== '') {
      navigator.clipboard.writeText(cardData.descriereCaz.titlu).then(() => {
        console.log('DEBUG: Titlu copiat cu succes');
        // Toast mic de confirmare
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 14px;
          z-index: 999999;
          animation: fadeIn 0.3s ease-out;
        `;
        toast.textContent = 'Titlu copiat în clipboard!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }, 2000);
      }).catch(err => {
        console.error('Eroare la copiere:', err);
      });
    } else {
      console.log('DEBUG: Titlu gol sau undefined');
    }
  }, [cardData.descriereCaz?.titlu]);

  // Funcție pentru copiere descriere în clipboard
  const copyDescriptionToClipboard = useCallback(() => {
    console.log('DEBUG: Încercare copiere descriere:', cardData.descriereCaz?.descriere);
    if (cardData.descriereCaz?.descriere && cardData.descriereCaz.descriere.trim() !== '') {
      navigator.clipboard.writeText(cardData.descriereCaz.descriere).then(() => {
        console.log('DEBUG: Descriere copiată cu succes');
        // Toast mic de confirmare
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 14px;
          z-index: 999999;
          animation: fadeIn 0.3s ease-out;
        `;
        toast.textContent = 'Descriere copiată în clipboard!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }, 2000);
      }).catch(err => {
        console.error('Eroare la copiere:', err);
      });
    } else {
      console.log('DEBUG: Descriere goală sau undefined');
    }
  }, [cardData.descriereCaz?.descriere]);

  // Funcție pentru afișarea toast-ului de incompatibilitate
  const showIncompatibilitateToast = useCallback(() => {
    // Creăm elementul toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc3545;
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(220, 53, 69, 0.5);
      text-align: center;
      max-width: 400px;
      animation: fadeIn 0.3s ease-out;
    `;
    toast.textContent = 'Combo nepermis, te rog verifică sancțiunile';
    
    document.body.appendChild(toast);
    
    // Eliminăm toast-ul după 5 secunde
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }, []);

  // Verificăm incompatibilitățile când se schimbă infracțiunile
  useEffect(() => {
    const { areIncompatibilitati, mesaje } = checkIncompatibilitati();
    
    if (areIncompatibilitati) {
      showIncompatibilitateToast();
    }
    
    // Setăm starea pentru afișarea în card
    setIncompatibilitati(mesaje);
  }, [checkIncompatibilitati, showIncompatibilitateToast]);

  // State pentru mesajele de incompatibilitate
  const [incompatibilitati, setIncompatibilitati] = useState([]);
  const calculateTotalAmenda = () => {
    let total = 0;
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    infractiuni.forEach(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        
        if (infracțiune && infracțiune.amendaMin && infracțiune.amendaMax) {
          // Adăugăm media amenzii (sau valoarea exactă dacă e aceeași)
          const amenda = infracțiune.amendaMin === infracțiune.amendaMax 
            ? infracțiune.amendaMin 
            : Math.floor((infracțiune.amendaMin + infracțiune.amendaMax) / 2);
          total += amenda;
        }
      }
    });
    
    return total > 0 ? `${total} $` : '';
  };

  // Funcție pentru calcularea totalului arestului
  const calculateTotalArest = () => {
    let minTotal = 0;
    let maxTotal = 0;
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    infractiuni.forEach(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        
        if (infracțiune) {
          if (infracțiune.arestPeViata) {
            // Arest pe viață înlocuiește orice altă sentință
            return 'Arest pe viață';
          }
          
          if (infracțiune.arestMin && infracțiune.arestMin > 0) {
            minTotal += infracțiune.arestMin;
          }
          if (infracțiune.arestMax && infracțiune.arestMax > 0) {
            maxTotal += infracțiune.arestMax;
          }
        }
      }
    });
    
    // Limităm maximul la 360 luni
    minTotal = Math.min(minTotal, 360);
    maxTotal = Math.min(maxTotal, 360);
    
    if (minTotal > 0 || maxTotal > 0) {
      if (minTotal === maxTotal) {
        return `${minTotal} luni`;
      } else {
        return `${minTotal} - ${maxTotal} luni`;
      }
    }
    
    return '';
  };

  // Funcție pentru calcularea totalului punctelor de permis
  const calculateTotalPuncte = () => {
    let total = 0;
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    infractiuni.forEach(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        
        if (infracțiune && infracțiune.punctePermis && infracțiune.punctePermis > 0) {
          total += infracțiune.punctePermis;
        }
      }
    });
    
    return total > 0 ? `${total} puncte` : '';
  };

  // Funcție pentru actualizarea automată a totalurilor
  const updateSanctiuniTotale = useCallback(() => {
    const amendaTotala = calculateTotalAmenda();
    const arestTotal = calculateTotalArest();
    const puncteTotal = calculateTotalPuncte();
    
    updateCardData('sanctiuni', 'amendaTotala', amendaTotala);
    updateCardData('sanctiuni', 'arestTotal', arestTotal);
    updateCardData('sanctiuni', 'punctePermis', puncteTotal);
  }, [cardData.incadrare.infractiune1, cardData.incadrare.infractiune2, cardData.incadrare.infractiune3, databaseData.codPenal]);

  // Funcție pentru verificarea dacă cel puțin o infracțiune are anulare permis
  const shouldCheckAnularePermis = () => {
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    return infractiuni.some(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        return infracțiune && infracțiune.anularePermis === true;
      }
      return false;
    });
  };

  // Funcție pentru verificarea dacă cel puțin o infracțiune are dosar penal
  const shouldCheckDosarPenal = () => {
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    return infractiuni.some(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        return infracțiune && infracțiune.dosarPenal === true;
      }
      return false;
    });
  };

  // Funcție pentru verificarea dacă cel puțin o infracțiune are perchezitie
  const shouldCheckPerchezitie = () => {
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    return infractiuni.some(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        return infracțiune && infracțiune.perchezitie === true;
      }
      return false;
    });
  };

  // Funcție pentru verificarea dacă cel puțin o infracțiune are ridicare vehicul
  const shouldCheckRidicareVehicul = () => {
    const infractiuni = [
      cardData.incadrare.infractiune1,
      cardData.incadrare.infractiune2,
      cardData.incadrare.infractiune3
    ];
    
    return infractiuni.some(infractiuneText => {
      if (infractiuneText && infractiuneText.trim() !== '') {
        const infracțiune = databaseData.codPenal.find(item => 
          `${item.cap} - Art. ${item.numarArticol} - ${item.titlu}` === infractiuneText
        );
        return infracțiune && infracțiune.ridicareVehicul === true;
      }
      return false;
    });
  };

  // Funcție pentru actualizarea automată a stărilor butoanelor
  const updateCheckboxStates = useCallback(() => {
    const anularePermis = shouldCheckAnularePermis();
    const dosarPenal = shouldCheckDosarPenal();
    const perchezitie = shouldCheckPerchezitie();
    const ridicareVehicul = shouldCheckRidicareVehicul();
    
    updateCardData('sanctiuni', 'anularePermis', anularePermis ? 'Da' : '');
    updateCardData('sanctiuni', 'dosarPenal', dosarPenal ? 'Da' : '');
    updateCardData('sanctiuni', 'perchezitie', perchezitie ? 'Da' : '');
    updateCardData('sanctiuni', 'ridicareVehicul', ridicareVehicul ? 'Da' : '');
  }, [cardData.incadrare.infractiune1, cardData.incadrare.infractiune2, cardData.incadrare.infractiune3, databaseData.codPenal]);

  // Efect pentru actualizarea automată a stărilor butoanelor când se schimbă infracțiunile
  useEffect(() => {
    updateCheckboxStates();
  }, [updateCheckboxStates]);
  useEffect(() => {
    updateSanctiuniTotale();
  }, [updateSanctiuniTotale]);

  // Funcție pentru a actualiza data și ora
  const updateDateTime = () => {
    const { date, time, dateDisplay } = getCurrentDateTime();
    setCardData(prev => ({
      ...prev,
      generale: {
        ...prev.generale,
        data: date,
        ora: time
      }
    }));
    
    // Afișăm data formatată în consolă pentru debug
    console.log('Data actualizată:', dateDisplay);
  };

  // Inițializăm data și ora la montarea componentei
  useEffect(() => {
    updateDateTime();
  }, []);

  return (
    <div className="mdt-page">
      <div className="page-header">
        <h1>MDT Assistant</h1>
        <p>Mobile Data Terminal - Asistent pentru Poliție</p>
      </div>

      <div className="mdt-content">
      {/* Card Caută în Codul Penal - Float Movable - mereu vizibil */}
      <div 
        className={`mdt-section search-section floating-card ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${!isContentVisible ? 'content-hidden' : ''}`}
        style={{
          position: 'fixed',
          left: `${cardPosition.x}px`,
          top: `${cardPosition.y}px`,
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
            {/* Resize handles */}
            <div 
              className="resize-handle resize-right"
              onMouseDown={handleResizeMouseDown}
              title="Redimensionează lățimea"
            />
            <div 
              className="resize-handle resize-bottom"
              onMouseDown={handleResizeMouseDown}
              title="Redimensionează înălțimea"
            />
            <div 
              className="resize-handle resize-corner"
              onMouseDown={handleResizeMouseDown}
              title="Redimensionează diagonal"
            />
            
            {/* Header pentru card - nu mai e colapsabil */}
            <div 
              className={`card-header ${isContentVisible ? 'content-visible' : ''}`}
              title="Card de căutare infracțiuni"
              onDoubleClick={handleLabelDoubleClick}
            >
              <span 
                className="search-label" 
                title="Dublu-click pentru a ascunde/afișa conținutul"
              >
                Caută Infracțiune
              </span>
            </div>
            
            {/* Conținut cardului - afișat doar dacă isContentVisible este true */}
            {isContentVisible && (
              <div className="card-content">
              {/* Verificare dacă se încarcă datele */}
              {isLoading && (
                <div className="loading-message">
                  <p>🔄 Se încarcă datele...</p>
                </div>
              )}
              
              {/* Verificare dacă există date */}
              {!isLoading && databaseData.codPenal.length === 0 && (
                <div className="no-data-message">
                  <p>📭 Nu există date în baza de date</p>
                </div>
              )}
              
              {/* Căutare și rezultate */}
              {!isLoading && databaseData.codPenal.length > 0 && (
                <>
                  <div className="search-form">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Caută în Codul Penal... (click pentru listă completă)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={showAllInfractionsList}
                        title="Click pentru a vedea toate infracțiunile"
                      />
                      {searchTerm && (
                        <button 
                          className="search-clear-button glow-button glow-hover"
                          onClick={() => setSearchTerm('')}
                          title="Golește căutarea"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista completă de infracțiuni - limitat la 2 rezultate vizibile */}
                  {showAllInfractions && !selectedResultId && (
                    <div className="search-results-scrollable">
                      <div className="results-list">
                        {databaseData.codPenal.map((articol) => (
                          <div 
                            key={articol.id}
                            className="result-item"
                            onClick={() => showItemDetails(articol, 'codPenal')}
                          >
                            <div className="result-header">
                              <span className="result-article">Art. {articol.numarArticol}</span>
                              <span className="result-capitol">{articol.cap}</span>
                            </div>
                            <div className="result-title">{articol.titlu}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rezultate căutare cu scroll - limitat la 2 rezultate vizibile */}
                  {searchResults.length > 0 && !showAllInfractions && !selectedResultId && (
                    <div className="search-results-scrollable">
                      <div className="results-list">
                        {searchResults.map((articol) => (
                          <div 
                            key={articol.id}
                            className="result-item"
                            onClick={() => showItemDetails(articol, 'codPenal')}
                          >
                            <div className="result-header">
                              <span className="result-article">Art. {articol.numarArticol}</span>
                              <span className="result-capitol">{articol.cap}</span>
                            </div>
                            <div className="result-title">{articol.titlu}</div>
                            <div className="result-sanctions">
                              {getSancțiuniForInfracțiune(articol.titlu).map((sancțiune, index) => (
                                <div key={index} className="sanction-item">• {sancțiune}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Detalii în interiorul cardului - afișate singure */}
                  {selectedResultId && detailItem && detailType === 'codPenal' && (
                    <div className="result-details">
                      <div className="result-details-header">
                        <h4>{detailItem.cap} - Art. {detailItem.numarArticol}</h4>
                        <div className="details-buttons">
                          <button 
                            className="details-back-button glow-button glow-hover"
                            onClick={showAllInfractions ? backToSearch : deselectResult}
                            title={showAllInfractions ? "Înapoi la listă" : "Înapoi la rezultate"}
                          >
                            ←
                          </button>
                        </div>
                      </div>
                      <div className="result-details-content">
                        <h5>{detailItem.titlu}</h5>
                        <p><strong>Definiție:</strong> {detailItem.definitie}</p>
                        <div className="result-sanctions">
                          <strong>Sancțiuni:</strong>
                          {getSancțiuniForInfracțiune(detailItem.titlu).map((sancțiune, index) => (
                            <p key={index}>{sancțiune}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mesaj când nu sunt rezultate */}
                  {searchTerm && searchResults.length === 0 && !showAllInfractions && (
                    <div className="no-results">
                      <p>Nu s-au găsit rezultate pentru "{searchTerm}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
            )}
      </div>
      </div>

      {/* Card Detalii Constatare pe toată lățimea */}
      <div className="constatare-fapte-full-width">
        <div className="glass-section">
          <div className="details-content">
            <div className="constatare-options-horizontal">
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Autoconstatare"
                  checked={cardData.constatare.tipConstatare === 'Autoconstatare'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Autoconstatare</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Apel 112"
                  checked={cardData.constatare.tipConstatare === 'Apel 112'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Apel 112</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Focuri de armă"
                  checked={cardData.constatare.tipConstatare === 'Focuri de armă'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Focuri de armă</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Jaf"
                  checked={cardData.constatare.tipConstatare === 'Jaf'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Jaf</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Furt Auto"
                  checked={cardData.constatare.tipConstatare === 'Furt Auto'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Furt Auto</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Rutieră"
                  checked={cardData.constatare.tipConstatare === 'Rutieră'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Rutieră</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Mineriadă"
                  checked={cardData.constatare.tipConstatare === 'Mineriadă'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Mineriadă</span>
              </label>
              <label className="radio-button-label">
                <input
                  type="radio"
                  name="tipConstatare"
                  value="Razie"
                  checked={cardData.constatare.tipConstatare === 'Razie'}
                  onChange={(e) => updateCardData('constatare', 'tipConstatare', e.target.value)}
                  className="radio-button-input"
                />
                <span className="radio-button-text">Razie</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Secțiune Carduri Detalii */}
      <div className={`details-cards-section ${getCardsLayoutClass()}`}>
        {/* Cardurile detaliabile - toate mereu vizibile */}
        <div className="details-cards-container">
          {/* Coloana stânga: Doar Detalii Generale */}
          <div className="details-column left">
            {/* Card Detalii Generale */}
            <div className="glass-section">
              <div className="glass-section-content">
                  <div className="detail-row">
                    <div className="detail-field">
                      <div className="input-with-button">
                        <input 
                          type="date" 
                          value={cardData.generale.data}
                          onChange={(e) => updateCardData('generale', 'data', e.target.value)}
                          className="detail-input"
                        />
                        <input 
                          type="text" 
                          value={cardData.generale.ora}
                          onChange={(e) => {
                            // Validăm formatul HH:MM
                            const value = e.target.value;
                            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                            if (value === '' || timeRegex.test(value)) {
                              updateCardData('generale', 'ora', value);
                            }
                          }}
                          className="detail-input"
                          placeholder="HH:MM"
                          maxLength="5"
                        />
                        <button 
                          className="refresh-datetime-button glass-button"
                          onClick={updateDateTime}
                          title="Actualizează data și ora"
                        >
                          <FontAwesomeIcon icon={faSync} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <input 
                        type="text" 
                        value={cardData.generale.numeSuspect}
                        onChange={(e) => updateCardData('generale', 'numeSuspect', e.target.value)}
                        className={getInputClassName(cardData.generale.numeSuspect)}
                        placeholder="Introduceți numele suspectului..."
                      />
                    </div>
                    <div className="detail-field">
                      <div className="cnp-input-container">
                        <input 
                          type="text" 
                          value={cardData.generale.cnpSuspect}
                          onChange={(e) => updateCardData('generale', 'cnpSuspect', e.target.value)}
                          className={getInputClassName(cardData.generale.cnpSuspect)}
                          placeholder="CNP suspect..."
                          maxLength="10"
                        />
                      </div>
                    </div>
                    <div className="detail-field checkbox-field">
                      <div className="checkbox-group">
                        <label className="checkbox-button">
                          <input 
                            type="checkbox" 
                            checked={cardData.generale.cnpSuspectType === 'complice'}
                            onChange={(e) => updateCardData('generale', 'cnpSuspectType', e.target.checked ? 'complice' : '')}
                          />
                          <span className="checkbox-text complice">Complice</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <input 
                        type="text" 
                        value={cardData.generale.numeParteVatamate}
                        onChange={(e) => updateCardData('generale', 'numeParteVatamate', e.target.value)}
                        className={getInputClassName(cardData.generale.numeParteVatamate)}
                        placeholder="Introduceți numele părții vătămate..."
                      />
                    </div>
                    <div className="detail-field">
                      <div className="cnp-input-container">
                        <input 
                          type="text" 
                          value={cardData.generale.cnpParteVatamate}
                          onChange={(e) => updateCardData('generale', 'cnpParteVatamate', e.target.value)}
                          className={getInputClassName(cardData.generale.cnpParteVatamate)}
                          placeholder="CNP parte vătămată..."
                          maxLength="10"
                        />
                      </div>
                    </div>
                    <div className="detail-field checkbox-field">
                      <div className="checkbox-group">
                        <label className="checkbox-button">
                          <input 
                            type="checkbox" 
                            checked={cardData.generale.cnpParteVatamataType === 'poliție'}
                            onChange={(e) => updateCardData('generale', 'cnpParteVatamataType', e.target.checked ? 'poliție' : '')}
                          />
                          <span className="checkbox-text politie-victim">Poliție</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={locationSearchTerm}
                          onChange={(e) => handleLocationSearch(e.target.value)}
                          onFocus={handleLocationFocus}
                          onBlur={handleLocationBlur}
                          className={getInputClassName(locationSearchTerm)}
                          placeholder="Caută locație... (click pentru listă completă)"
                        />
                        {locationSearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              setLocationSearchTerm('');
                              updateCardData('generale', 'locatia', '');
                              updateCardData('generale', 'limitaViteza', '');
                            }}
                            title="Golește câmpul"
                          >
                            ×
                          </button>
                        )}
                        {showLocationDropdown && locationSearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {locationSearchResults.map((location) => (
                              <div 
                                key={location.id}
                                className="autocomplete-item"
                                onClick={() => handleLocationSelect(location)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">{location.strada}</span>
                                  <span className="autocomplete-item-capitol">{location.limita ? `Limita: ${location.limita}` : ''}</span>
                                </div>
                                <div className="autocomplete-item-title">
                                  {location.localitate && `${location.localitate}, `}{location.strada}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="detail-field">
                      <div className="speed-limit-circle" style={{ marginTop: '-10px' }}>
                        <div className="speed-limit-text">
                          {cardData.generale.limitaViteza || (
                            <div className="speed-limit-placeholder">
                              <div>Speed</div>
                              <div>Limit</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Câmp Obiectiv Jaf - apare doar când este selectat "Jaf" */}
                  {cardData.constatare.tipConstatare === 'Jaf' && (
                    <div className="detail-row">
                      <div className="detail-field">
                        <input 
                          type="text" 
                          value={cardData.generale.obiectivJaf}
                          onChange={(e) => updateCardData('generale', 'obiectivJaf', e.target.value)}
                          className={getInputClassName(cardData.generale.obiectivJaf)}
                          placeholder="Introduceți obiectivul jafului..."
                        />
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <div className="detail-field">
                      <input 
                        type="text" 
                        value={cardData.generale.vitezaInregistrata}
                        onChange={(e) => updateCardData('generale', 'vitezaInregistrata', e.target.value)}
                        className={getInputClassName(cardData.generale.vitezaInregistrata)}
                        placeholder="Viteza înregistrată..."
                      />
                    </div>
                  </div>
                </div>
              </div>

                        </div>

          {/* Coloana din mijloc: Detalii Vehicul */}
          <div className="details-column middle">
            {/* Card Detalii Vehicul */}
            <div className="glass-section">
              <div className="glass-section-content">
                  <div className="detail-row">
                    <div className="detail-field">
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={vehicleTypeSearchTerm}
                          onChange={(e) => handleVehicleTypeSearch(e.target.value)}
                          onFocus={handleVehicleTypeFocus}
                          onBlur={handleVehicleTypeBlur}
                          className={getInputClassName(vehicleTypeSearchTerm)}
                          placeholder="Caută tip vehicul... (click pentru listă completă)"
                        />
                        {vehicleTypeSearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              setVehicleTypeSearchTerm('');
                              updateCardData('vehicul', 'tipVehicul', '');
                            }}
                            title="Golește câmpul"
                          >
                            ×
                          </button>
                        )}
                        {showVehicleTypeDropdown && vehicleTypeSearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {vehicleTypeSearchResults.map((vehicleType) => (
                              <div 
                                key={vehicleType.id}
                                className="autocomplete-item"
                                onClick={() => handleVehicleTypeSelect(vehicleType)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">{vehicleType.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="detail-field">
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={vehicleModelSearchTerm}
                          onChange={(e) => handleVehicleModelSearch(e.target.value)}
                          onFocus={handleVehicleModelFocus}
                          onBlur={handleVehicleModelBlur}
                          className={getInputClassName(vehicleModelSearchTerm)}
                          placeholder="Caută model vehicul... (click pentru listă completă)"
                        />
                        {vehicleModelSearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              setVehicleModelSearchTerm('');
                              updateCardData('vehicul', 'modelVehicul', '');
                            }}
                            title="Golește câmpul"
                          >
                            ×
                          </button>
                        )}
                        {showVehicleModelDropdown && vehicleModelSearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {vehicleModelSearchResults.map((vehicleModel) => (
                              <div 
                                key={vehicleModel.id}
                                className="autocomplete-item"
                                onClick={() => handleVehicleModelSelect(vehicleModel)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">{vehicleModel.name}</span>
                                  <span className="autocomplete-item-capitol">{vehicleModel.type || 'Unknown'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <input 
                        type="text" 
                        value={cardData.vehicul.culoareVehicul}
                        onChange={(e) => updateCardData('vehicul', 'culoareVehicul', e.target.value)}
                        className={getInputClassName(cardData.vehicul.culoareVehicul)}
                        placeholder="Introduceți culoarea vehiculului..."
                      />
                    </div>
                    <div className="detail-field">
                      <input 
                        type="text" 
                        value={cardData.vehicul.numereInmatriculare}
                        onChange={(e) => updateCardData('vehicul', 'numereInmatriculare', e.target.value)}
                        className={getInputClassName(cardData.vehicul.numereInmatriculare)}
                        placeholder="Introduceți numărul de înmatriculare..."
                      />
                    </div>
                    <div className="detail-field">
                      <div className="autospeciala-autocomplete">
                        <input 
                          type="text" 
                          value={autospecialaSearchTerm}
                          onChange={(e) => handleAutospecialaSearch(e.target.value)}
                          onFocus={handleAutospecialaFocus}
                          onBlur={handleAutospecialaBlur}
                          className="detail-input autocomplete-input"
                          placeholder="Autospecială implicată..."
                        />
                        {autospecialaSearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              setAutospecialaSearchTerm('');
                              updateCardData('vehicul', 'autospeciala', '');
                            }}
                          >
                            ×
                          </button>
                        )}
                        {showAutospecialaDropdown && autospecialaSearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {autospecialaSearchResults.map((autospeciala) => (
                              <div 
                                key={autospeciala.id}
                                className="autocomplete-item"
                                onClick={() => handleAutospecialaSelect(autospeciala)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">{autospeciala.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Percheziție */}
              <div className="glass-section">
                <div className="glass-section-content">
                  <div className="detail-row">
                    <div className="detail-field full-width">
                      <div className="perchezitie-field">
                        <input
                          type="checkbox"
                          checked={cardData.constatare.buzunare}
                          onChange={(e) => updateCardData('constatare', 'buzunare', e.target.checked)}
                          className="checkbox-input"
                        />
                        <input 
                          type="text" 
                          value={cardData.constatare.buzunareText}
                          onChange={(e) => updateCardData('constatare', 'buzunareText', e.target.value)}
                          className={getInputClassName(cardData.constatare.buzunareText)}
                          placeholder="Buzunare..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field full-width">
                      <div className="perchezitie-field">
                        <input
                          type="checkbox"
                          checked={cardData.constatare.torpedo}
                          onChange={(e) => updateCardData('constatare', 'torpedo', e.target.checked)}
                          className="checkbox-input"
                        />
                        <input 
                          type="text" 
                          value={cardData.constatare.torpedoText}
                          onChange={(e) => updateCardData('constatare', 'torpedoText', e.target.value)}
                          className={getInputClassName(cardData.constatare.torpedoText)}
                          placeholder="Torpedo..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field full-width">
                      <div className="perchezitie-field">
                        <input
                          type="checkbox"
                          checked={cardData.constatare.portbagaj}
                          onChange={(e) => updateCardData('constatare', 'portbagaj', e.target.checked)}
                          className="checkbox-input"
                        />
                        <input 
                          type="text" 
                          value={cardData.constatare.portbagajText}
                          onChange={(e) => updateCardData('constatare', 'portbagajText', e.target.value)}
                          className={getInputClassName(cardData.constatare.portbagajText)}
                          placeholder="Portbagaj..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Coloana dreapta: Carduri separate Detalii Suplimentare */}
          <div className="details-column right">
            {/* Card Crimă Organizată */}
            <div className="glass-section">
              <div className="glass-section-content">
                <div className="detail-row">
                  <div className="detail-field full-width">
                    <input 
                      type="text" 
                      value={cardData.constatare.tigariContrabanda}
                      onChange={(e) => updateCardData('constatare', 'tigariContrabanda', e.target.value)}
                      className={getInputClassName(cardData.constatare.tigariContrabanda)}
                      placeholder="Țigări de contrabandă..."
                    />
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.constatare.droguriRisc}
                      onChange={(e) => updateCardData('constatare', 'droguriRisc', e.target.value)}
                      className={getInputClassName(cardData.constatare.droguriRisc)}
                      placeholder="Droguri de risc..."
                    />
                  </div>
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.constatare.droguriRiscCantitate}
                      onChange={(e) => updateCardData('constatare', 'droguriRiscCantitate', e.target.value)}
                      className={getInputClassName(cardData.constatare.droguriRiscCantitate)}
                      placeholder="Cantitate..."
                    />
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.constatare.droguriMareRisc}
                      onChange={(e) => updateCardData('constatare', 'droguriMareRisc', e.target.value)}
                      className={getInputClassName(cardData.constatare.droguriMareRisc)}
                      placeholder="Droguri de mare risc..."
                    />
                  </div>
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.constatare.droguriMareRiscCantitate}
                      onChange={(e) => updateCardData('constatare', 'droguriMareRiscCantitate', e.target.value)}
                      className={getInputClassName(cardData.constatare.droguriMareRiscCantitate)}
                      placeholder="Cantitate..."
                    />
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-field full-width">
                    <input 
                      type="text" 
                      value={cardData.constatare.baniMurdari}
                      onChange={(e) => updateCardData('constatare', 'baniMurdari', e.target.value)}
                      className={getInputClassName(cardData.constatare.baniMurdari)}
                      placeholder="Bani murdari..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Licențe */}
            <div className="glass-section" style={{ zIndex: 10 }}>
              <div className="glass-section-content">
                <div className="detail-row">
                  <div className="detail-field">
                    <div className="document-autocomplete">
                      <input 
                        type="text" 
                        value={document1SearchTerm}
                        onChange={(e) => handleDocument1Search(e.target.value)}
                        onFocus={handleDocument1Focus}
                        onBlur={handleDocument1Blur}
                        className="detail-input autocomplete-input"
                        placeholder="Document lipsă 1..."
                      />
                      {document1SearchTerm && (
                        <button 
                          className="autocomplete-clear-button"
                          onClick={() => {
                            setDocument1SearchTerm('');
                            updateCardData('constatare', 'documentLipsa1', '');
                          }}
                        >
                          ×
                        </button>
                      )}
                      {showDocument1Dropdown && document1SearchResults.length > 0 && (
                        <div className="autocomplete-dropdown document-dropdown">
                          {document1SearchResults.map((document) => (
                            <div 
                              key={document.id}
                              className="autocomplete-item"
                              onClick={() => handleDocument1Select(document)}
                            >
                              <div className="autocomplete-item-header">
                                <span className="autocomplete-item-article">{document.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="detail-field">
                    <div className="document-autocomplete">
                      <input 
                        type="text" 
                        value={document2SearchTerm}
                        onChange={(e) => handleDocument2Search(e.target.value)}
                        onFocus={handleDocument2Focus}
                        onBlur={handleDocument2Blur}
                        className="detail-input autocomplete-input"
                        placeholder="Document lipsă 2..."
                      />
                      {document2SearchTerm && (
                        <button 
                          className="autocomplete-clear-button"
                          onClick={() => {
                            setDocument2SearchTerm('');
                            updateCardData('constatare', 'documentLipsa2', '');
                          }}
                        >
                          ×
                        </button>
                      )}
                      {showDocument2Dropdown && document2SearchResults.length > 0 && (
                        <div className="autocomplete-dropdown document-dropdown">
                          {document2SearchResults.map((document) => (
                            <div 
                              key={document.id}
                              className="autocomplete-item"
                              onClick={() => handleDocument2Select(document)}
                            >
                              <div className="autocomplete-item-header">
                                <span className="autocomplete-item-article">{document.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Substanțe */}
            <div className="glass-section">
              <div className="glass-section-content">
                <div className="detail-row">
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.constatare.substantaSubInfluenta}
                      onChange={(e) => updateCardData('constatare', 'substantaSubInfluenta', e.target.value)}
                      className={getInputClassName(cardData.constatare.substantaSubInfluenta)}
                      placeholder="Substanța sub influență..."
                    />
                  </div>
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.constatare.rezultatTest}
                      onChange={(e) => updateCardData('constatare', 'rezultatTest', e.target.value)}
                      className={getInputClassName(cardData.constatare.rezultatTest)}
                      placeholder="Rezultat test..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Card Încadrare Fapte pe toată lățimea */}
        <div className="incadrare-fapte-full-width">
          <div className="glass-section">
            <div className="details-content">
              <div className="incadrare-sets-horizontal">
                {/* Set 1 */}
                <div className="incadrare-set">
                  <div className="incadrare-set-header">
                    <span className="set-number">1</span>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Infracțiune 1</label>
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={infractiune1SearchTerm}
                          onChange={(e) => handleInfractiune1Search(e.target.value)}
                          onFocus={handleInfractiune1Focus}
                          onBlur={handleInfractiune1Blur}
                          className="detail-input autocomplete-input"
                          placeholder="Caută infracțiune... (click pentru listă completă)"
                        />
                        {infractiune1SearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              handleInfractiune1Clear();
                            }}
                            title="Golește câmpul"
                          >
                            ×
                          </button>
                        )}
                        {showInfractiune1Dropdown && infractiune1SearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {infractiune1SearchResults.map((articol) => (
                              <div 
                                key={articol.id}
                                className="autocomplete-item"
                                onClick={() => handleInfractiune1Select(articol)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">Art. {articol.numarArticol}</span>
                                  <span className="autocomplete-item-capitol">{articol.cap}</span>
                                </div>
                                <div className="autocomplete-item-title">{articol.titlu}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Sancțiuni aplicate</label>
                      <div 
                        className="detail-input sanctions-display"
                        style={{
                          height: '48px', // Fix 2 rânduri
                          padding: '8px 12px',
                          backgroundColor: 'rgba(243, 156, 18, 0.1)',
                          border: '1px solid rgba(243, 156, 18, 0.3)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          color: '#f39c12',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'nowrap',
                          gap: '8px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getSancțiuniForInfracțiune(cardData.incadrare.infractiune1)?.length > 0 ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {getSancțiuniForInfracțiune(cardData.incadrare.infractiune1).map((sancțiune, index) => (
                              <span 
                                key={index} 
                                style={{
                                  background: 'rgba(243, 156, 18, 0.2)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(243, 156, 18, 0.4)',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {sancțiune}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                            Selectați o infracțiune pentru a vedea sancțiunile aplicate
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Previzualizare 1</label>
                      <div 
                        className="detail-input preview-display"
                        style={{
                          minHeight: '60px',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: processPreviewTemplate(cardData.incadrare.previzualizare1, cardData, '1')
                        }}
                      />
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Mențiuni 1</label>
                      <input 
                        type="text" 
                        value={cardData.incadrare.mentiuni1}
                        onChange={(e) => updateCardData('incadrare', 'mentiuni1', e.target.value)}
                        className={getInputClassName(cardData.incadrare.mentiuni1)}
                        placeholder="Introduceți mențiunile..."
                      />
                    </div>
                  </div>
                </div>

                {/* Set 2 */}
                <div className="incadrare-set">
                  <div className="incadrare-set-header">
                    <span className="set-number">2</span>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Infracțiune 2</label>
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={infractiune2SearchTerm}
                          onChange={(e) => handleInfractiune2Search(e.target.value)}
                          onFocus={handleInfractiune2Focus}
                          onBlur={handleInfractiune2Blur}
                          className="detail-input autocomplete-input"
                          placeholder="Caută infracțiune... (click pentru listă completă)"
                        />
                        {infractiune2SearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              handleInfractiune2Clear();
                            }}
                            title="Golește câmpul"
                          >
                            ×
                          </button>
                        )}
                        {showInfractiune2Dropdown && infractiune2SearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {infractiune2SearchResults.map((articol) => (
                              <div 
                                key={articol.id}
                                className="autocomplete-item"
                                onClick={() => handleInfractiune2Select(articol)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">Art. {articol.numarArticol}</span>
                                  <span className="autocomplete-item-capitol">{articol.cap}</span>
                                </div>
                                <div className="autocomplete-item-title">{articol.titlu}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Sancțiuni aplicate</label>
                      <div 
                        className="detail-input sanctions-display"
                        style={{
                          height: '48px', // Fix 2 rânduri
                          padding: '8px 12px',
                          backgroundColor: 'rgba(243, 156, 18, 0.1)',
                          border: '1px solid rgba(243, 156, 18, 0.3)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          color: '#f39c12',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'nowrap',
                          gap: '8px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getSancțiuniForInfracțiune(cardData.incadrare.infractiune2)?.length > 0 ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {getSancțiuniForInfracțiune(cardData.incadrare.infractiune2)?.map((sancțiune, index) => (
                              <span 
                                key={index} 
                                style={{
                                  background: 'rgba(243, 156, 18, 0.2)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(243, 156, 18, 0.4)',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {sancțiune}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                            Selectați o infracțiune pentru a vedea sancțiunile aplicate
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Previzualizare 2</label>
                      <div 
                        className="detail-input preview-display"
                        style={{
                          minHeight: '60px',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: processPreviewTemplate(cardData.incadrare.previzualizare2, cardData, '2')
                        }}
                      />
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Mențiuni 2</label>
                      <input 
                        type="text" 
                        value={cardData.incadrare.mentiuni2}
                        onChange={(e) => updateCardData('incadrare', 'mentiuni2', e.target.value)}
                        className={getInputClassName(cardData.incadrare.mentiuni2)}
                        placeholder="Introduceți mențiunile..."
                      />
                    </div>
                  </div>
                </div>

                {/* Set 3 */}
                <div className="incadrare-set">
                  <div className="incadrare-set-header">
                    <span className="set-number">3</span>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Infracțiune 3</label>
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={infractiune3SearchTerm}
                          onChange={(e) => handleInfractiune3Search(e.target.value)}
                          onFocus={handleInfractiune3Focus}
                          onBlur={handleInfractiune3Blur}
                          className="detail-input autocomplete-input"
                          placeholder="Caută infracțiune... (click pentru listă completă)"
                        />
                        {infractiune3SearchTerm && (
                          <button 
                            className="autocomplete-clear-button"
                            onClick={() => {
                              handleInfractiune3Clear();
                            }}
                            title="Golește câmpul"
                          >
                            ×
                          </button>
                        )}
                        {showInfractiune3Dropdown && infractiune3SearchResults.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {infractiune3SearchResults.map((articol) => (
                              <div 
                                key={articol.id}
                                className="autocomplete-item"
                                onClick={() => handleInfractiune3Select(articol)}
                              >
                                <div className="autocomplete-item-header">
                                  <span className="autocomplete-item-article">Art. {articol.numarArticol}</span>
                                  <span className="autocomplete-item-capitol">{articol.cap}</span>
                                </div>
                                <div className="autocomplete-item-title">{articol.titlu}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Sancțiuni aplicate</label>
                      <div 
                        className="detail-input sanctions-display"
                        style={{
                          height: '48px', // Fix 2 rânduri
                          padding: '8px 12px',
                          backgroundColor: 'rgba(243, 156, 18, 0.1)',
                          border: '1px solid rgba(243, 156, 18, 0.3)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          color: '#f39c12',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'nowrap',
                          gap: '8px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getSancțiuniForInfracțiune(cardData.incadrare.infractiune3)?.length > 0 ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {getSancțiuniForInfracțiune(cardData.incadrare.infractiune3)?.map((sancțiune, index) => (
                              <span 
                                key={index} 
                                style={{
                                  background: 'rgba(243, 156, 18, 0.2)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(243, 156, 18, 0.4)',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {sancțiune}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                            Selectați o infracțiune pentru a vedea sancțiunile aplicate
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Previzualizare 3</label>
                      <div 
                        className="detail-input preview-display"
                        style={{
                          minHeight: '60px',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: processPreviewTemplate(cardData.incadrare.previzualizare3, cardData, '3')
                        }}
                      />
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-field">
                      <label>Mențiuni 3</label>
                      <input 
                        type="text" 
                        value={cardData.incadrare.mentiuni3}
                        onChange={(e) => updateCardData('incadrare', 'mentiuni3', e.target.value)}
                        className={getInputClassName(cardData.incadrare.mentiuni3)}
                        placeholder="Introduceți mențiunile..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mesaje de incompatibilitate */}
          {incompatibilitati.length > 0 && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: '8px',
              color: '#dc3545'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
                ⚠️ Combo de sancțiuni nepermis detectat:
              </div>
              {incompatibilitati.map((incompatibilitate, index) => (
                <div key={index} style={{ fontSize: '12px', marginBottom: '5px' }}>
                  • {incompatibilitate.infractiune1} + {incompatibilitate.infractiune2}
                  {incompatibilitate.motiv && ` - ${incompatibilitate.motiv}`}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Sancțiuni & Descriere Caz pe toată lățimea */}
        <div className="sanciuni-descriere-full-width">
          <div className="glass-section" style={{ zIndex: 1 }}>
            <div className="details-content">
              {/* Secțiune Sancțiuni acordate */}
              <div className="sanciuni-section">
                <div className="detail-row">
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.sanctiuni.amendaTotala || ''}
                      readOnly
                      className="detail-input"
                      style={{
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        border: '1px solid rgba(46, 204, 113, 0.3)',
                        color: '#2ecc71',
                        fontWeight: '600',
                        width: '200px'
                      }}
                      placeholder="Total Amendă..."
                    />
                  </div>
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.sanctiuni.arestTotal || ''}
                      readOnly
                      className="detail-input"
                      style={{
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        color: '#e74c3c',
                        fontWeight: '600',
                        width: '200px'
                      }}
                      placeholder="Total Arest..."
                    />
                  </div>
                  <div className="detail-field">
                    <input 
                      type="text" 
                      value={cardData.sanctiuni.punctePermis || ''}
                      readOnly
                      className="detail-input"
                      style={{
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.3)',
                        color: '#3498db',
                        fontWeight: '600',
                        width: '200px'
                      }}
                      placeholder="Puncte Permis..."
                    />
                  </div>
                  <button 
                    type="button"
                    className={`checkbox-button automated-checkbox ${cardData.sanctiuni.anularePermis ? 'active' : ''}`}
                    title="Automat: Activat dacă cel puțin o infracțiune selectată are sancțiunea Anulare Permis"
                    style={{
                      height: '38px',
                      fontSize: '12px',
                      padding: '3px 4px',
                      cursor: 'default',
                      width: '200px',
                      '--active-color': '#FFA500'
                    }}
                  >
                    Anulare Permis
                  </button>
                  <button 
                    type="button"
                    className={`checkbox-button automated-checkbox ${cardData.sanctiuni.dosarPenal ? 'active' : ''}`}
                    title="Automat: Activat dacă cel puțin o infracțiune selectată are sancțiunea Dosar Penal"
                    style={{
                      height: '38px',
                      fontSize: '12px',
                      padding: '3px 4px',
                      cursor: 'default',
                      width: '200px',
                      '--active-color': '#FF0000'
                    }}
                  >
                    Dosar Penal
                  </button>
                  <button 
                    type="button"
                    className={`checkbox-button automated-checkbox ${cardData.sanctiuni.perchezitie ? 'active' : ''}`}
                    title="Automat: Activat dacă cel puțin o infracțiune selectată are sancțiunea Percheziție"
                    style={{
                      height: '38px',
                      fontSize: '12px',
                      padding: '3px 4px',
                      cursor: 'default',
                      width: '200px',
                      '--active-color': '#008080'
                    }}
                  >
                    Percheziție
                  </button>
                  <button 
                    type="button"
                    className={`checkbox-button automated-checkbox ${cardData.sanctiuni.ridicareVehicul ? 'active' : ''}`}
                    title="Automat: Activat dacă cel puțin o infracțiune selectată are sancțiunea Ridicare Vehicul"
                    style={{
                      height: '38px',
                      fontSize: '12px',
                      padding: '3px 4px',
                      cursor: 'default',
                      width: '200px',
                      '--active-color': '#9B59B6'
                    }}
                  >
                    Ridicare Vehicul
                  </button>
                </div>
                </div>
              </div>

              {/* Secțiune Descriere Caz */}
              <div className="descriere-caz-section">
                {/* Secțiune Generare */}
                {(generatedTitle || generatedDescription) && (
                  <div className="generated-output-section">
                    <div className="detail-row">
                      <div className="detail-field full-width">
                        <input 
                          type="text" 
                          value={generatedTitle || ''}
                          readOnly
                          className="detail-input generated-title"
                          placeholder="Titlu generat..."
                        />
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-field full-width">
                        <textarea 
                          value={generatedDescription || ''}
                          readOnly
                          className="detail-input textarea-large generated-description"
                          placeholder="Structură generală..."
                          rows="6"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Butoane acțiune */}
                <div className="action-buttons-row">
                  <button 
                    className="action-button glass-button"
                    onClick={generateDescription}
                  >
                    Generează Descriere
                  </button>
                  <button 
                    className="action-button glass-button"
                    onClick={copyTitleToClipboard}
                  >
                    Copiere Titlu
                  </button>
                  <button 
                    className="action-button glass-button"
                    onClick={copyDescriptionToClipboard}
                  >
                    Copiere Descriere
                  </button>
                  <button 
                    className="action-button glass-button"
                    onClick={resetForm}
                  >
                    Resetează Formular
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Popup Detalii */}
      {showDetailPopup && detailItem && (
        <div className="detail-popup" onClick={closeDetailPopup}>
          <div className="detail-popup-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-popup-header">
              <h2>
                {detailType === 'codPenal' && `${detailItem.cap} - Art. ${detailItem.numarArticol}`}
              </h2>
              <button className="close-button glow-button glow-hover" onClick={closeDetailPopup}>×</button>
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
                    {detailItem.dosarPenal && <p>Dosar Penal</p>}
                    {detailItem.perchezitie && <p>Percheziție</p>}
                    {detailItem.ridicareVehicul && <p>Ridicare Vehicul</p>}
                    {detailItem.punctePermis > 0 && <p>Puncte Permis: {detailItem.punctePermis}</p>}
                    {detailItem.anularePermis && <p>Anulare Permis</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MDTPage;
