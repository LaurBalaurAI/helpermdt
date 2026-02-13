import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDesktop, faBuilding, faLayerGroup, faKeyboard, faLink, faCog, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, activePage, navigateTo }) => {
  const menuItems = [
    { id: 'dashboard', icon: faHome, label: 'Dashboard' },
    { id: 'mdt', icon: faDesktop, label: 'MDT' },
    { id: 'ipj', icon: faBuilding, label: 'I.P.J. Los Santos' },
    { id: 'overlays', icon: faLayerGroup, label: 'Overlays' },
    { id: 'hotkeys', icon: faKeyboard, label: 'Hotkeys' },
    { id: 'binds', icon: faLink, label: 'Binds' },
    { id: 'settings', icon: faCog, label: 'Setări' },
    { id: 'info', icon: faInfoCircle, label: 'Info' }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li 
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              <span className="nav-text">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
