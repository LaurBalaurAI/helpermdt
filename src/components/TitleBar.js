import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import '../styles/TitleBar.css';

const TitleBar = ({ toggleSidebar }) => {
  const [romaniaTime, setRomaniaTime] = useState(new Date());

  // Actualizăm ora României la fiecare secundă
  useEffect(() => {
    const updateRomaniaTime = () => {
      // Creăm o dată în fusul orar al României (Europe/Bucharest)
      const now = new Date();
      const romaniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
      setRomaniaTime(romaniaTime);
    };

    updateRomaniaTime(); // Actualizare imediată
    const interval = setInterval(updateRomaniaTime, 1000); // Actualizare la fiecare secundă

    return () => clearInterval(interval); // Cleanup
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    } else if (window.require) {
      // Fallback pentru producție
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('minimize-window');
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    } else if (window.require) {
      // Fallback pentru producție
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('maximize-window');
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    } else if (window.require) {
      // Fallback pentru producție
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('close-window');
    }
  };

  const handleQuit = () => {
    if (window.electronAPI) {
      window.electronAPI.quitApp();
    } else if (window.require) {
      // Fallback pentru producție
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('quit-app');
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <button className="logo-toggle" onClick={toggleSidebar}>
          <img src={logo} alt="Police Helper Logo" className="title-logo" />
        </button>
        <div className="title-bar-drag">
          <span className="title-text">Police Helper Enhanced</span>
        </div>
      </div>
      <div className="title-bar-center">
        <div className="romania-clock">
          <div className="clock-time">{formatTime(romaniaTime)}</div>
        </div>
      </div>
      <div className="title-bar-controls">
        <button className="control-btn minimize-btn" onClick={handleMinimize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <button className="control-btn maximize-btn" onClick={handleMaximize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
        <button className="control-btn close-btn" onClick={handleClose}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <button className="control-btn quit-btn" onClick={handleQuit}>
          <FontAwesomeIcon icon={faPowerOff} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
