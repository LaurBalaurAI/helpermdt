import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/themes.css';

// Context
import { DatabaseProvider } from './contexts/DatabaseContext';

// Components
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import MDTPage from './pages/MDTPage';
import IPJPage from './pages/IPJPage';
import OverlaysPage from './pages/OverlaysPage';
import HotkeysPage from './pages/HotkeysPage';
import BindsPage from './pages/BindsPage';
import SettingsPage from './pages/SettingsPage';
import InfoPage from './pages/InfoPage';
import { applyThemePreview } from './pages/SettingsPage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [policeLightsEnabled, setPoliceLightsEnabled] = useState(() => {
    // Load from localStorage during initialization
    const saved = localStorage.getItem('policeLightsEnabled');
    return saved ? saved === 'true' : false;
  });

  // Apply background and save to localStorage when state changes
  useEffect(() => {
    console.log('Police Lights state changed to:', policeLightsEnabled);
    
    // Save to localStorage
    localStorage.setItem('policeLightsEnabled', policeLightsEnabled.toString());
    console.log('Saved to localStorage:', localStorage.getItem('policeLightsEnabled'));
    
    // Apply background
    let targetElement = document.querySelector('.app') || document.querySelector('#root') || document.body;
    
    if (targetElement) {
      if (policeLightsEnabled) {
        console.log('Applying Police Lights background');
        
        // Use relative path that works in both development and production
        targetElement.style.backgroundImage = 'url(./background.gif)';
        targetElement.style.backgroundSize = 'cover';
        targetElement.style.backgroundPosition = 'center';
        targetElement.style.backgroundAttachment = 'fixed';
        targetElement.style.backgroundRepeat = 'no-repeat';
      } else {
        console.log('Applying black background');
        targetElement.style.backgroundImage = 'none';
        targetElement.style.backgroundColor = '#000000';
      }
    } else {
      console.error('Could not find main container element for background');
    }
  }, [policeLightsEnabled]);

  // Load and apply saved theme on startup
  useEffect(() => {
    const savedThemeId = localStorage.getItem('selectedTheme');
    if (savedThemeId) {
      console.log('Loading saved theme:', savedThemeId);
      
      // Încărcăm temele din localStorage
      const savedThemes = localStorage.getItem('customThemes');
      let themes = [];
      
      if (savedThemes) {
        try {
          themes = JSON.parse(savedThemes);
        } catch (error) {
          console.error('Error loading themes:', error);
        }
      }
      
      // Găsim tema selectată
      const selectedTheme = themes.find(t => t.id === savedThemeId);
      if (selectedTheme) {
        console.log('Applying saved theme:', selectedTheme);
        document.body.setAttribute('data-theme', savedThemeId);
        applyThemePreview(selectedTheme);
      } else {
        console.log('Saved theme not found, using default');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateTo = (page) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <LandingPage />;
      case 'mdt':
        return <MDTPage />;
      case 'ipj':
        return <IPJPage />;
      case 'overlays':
        return <OverlaysPage />;
      case 'hotkeys':
        return <HotkeysPage />;
      case 'binds':
        return <BindsPage />;
      case 'settings':
        return <SettingsPage policeLightsEnabled={policeLightsEnabled} setPoliceLightsEnabled={setPoliceLightsEnabled} />;
      case 'info':
        return <InfoPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <DatabaseProvider>
      <div className="app">
        <TitleBar toggleSidebar={toggleSidebar} />
        <div className="app-content">
          <Sidebar 
            isOpen={isSidebarOpen} 
            activePage={activePage}
            navigateTo={navigateTo}
          />
          <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {activePage === 'dashboard' && <LandingPage navigateTo={navigateTo} />}
            {activePage === 'mdt' && <MDTPage />}
            {activePage === 'ipj' && <IPJPage />}
            {activePage === 'overlays' && <OverlaysPage />}
            {activePage === 'hotkeys' && <HotkeysPage />}
            {activePage === 'binds' && <BindsPage />}
            {activePage === 'settings' && <SettingsPage policeLightsEnabled={policeLightsEnabled} setPoliceLightsEnabled={setPoliceLightsEnabled} />}
            {activePage === 'info' && <InfoPage />}
          </main>
        </div>
      </div>
    </DatabaseProvider>
  );
}

export default App;
