import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faBuilding, faLayerGroup, faKeyboard, faLink, faCog, faInfo } from '@fortawesome/free-solid-svg-icons';
import '../styles/LandingPage.css';

const LandingPage = ({ navigateTo }) => {
  const dashboardItems = [
    { id: 'mdt', icon: faDesktop, title: 'MDT Assistant', description: 'Mobile Data Terminal Assistant - Generează Amenzi și Dosare Penale' },
    { id: 'ipj', icon: faBuilding, title: 'I.P.J. Los Santos', description: 'Inspectoratul Poliției Județene Los Santos' },
    { id: 'overlays', icon: faLayerGroup, title: 'Overlays', description: 'Interfețe vizuale suprapuse peste joc' },
    { id: 'hotkeys', icon: faKeyboard, title: 'Hotkeys', description: 'Scurtături configurabile pentru aplicație' },
    { id: 'binds', icon: faLink, title: 'Binds', description: 'Legături rapide pentru comenzi frecvente în joc' },
    { id: 'settings', icon: faCog, title: 'Setări', description: 'Configurarea aplicației' }
  ];

  const handleInfoClick = () => {
    navigateTo('info');
  };

  const handleCardClick = (pageId) => {
    navigateTo(pageId);
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="dashboard-header">
          <h1 className="main-title">Police Helper Enhanced</h1>
          <h2 className="subtitle">I.P.J. Los Santos B-Zone</h2>
        </div>
        
        <div className="dashboard-grid">
          {dashboardItems.map(item => (
            <div key={item.id} className="dashboard-card" onClick={() => handleCardClick(item.id)}>
              <div className="card-icon">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <h3 className="card-title">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <button className="floating-info-btn" onClick={handleInfoClick}>
        <FontAwesomeIcon icon={faInfo} />
      </button>
    </div>
  );
};

export default LandingPage;
