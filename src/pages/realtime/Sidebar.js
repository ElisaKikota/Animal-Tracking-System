import React from 'react';
import reportsIcon from '../../assets/reports.png';
import patrolsIcon from '../../assets/patrols.png';
import layersIcon from '../../assets/layers.png';
import animalIcon from '../../assets/animal.png';
import remoteControlIcon from '../../assets/Remote Control Tag.png';

const Sidebar = ({ onMenuSelect, activeMenu }) => {
  const menuItems = [
    { id: 'reports', icon: reportsIcon, label: 'Reports' },
    { id: 'patrols', icon: patrolsIcon, label: 'Patrols' },
    { id: 'layers', icon: layersIcon, label: 'Layers' },
    { id: 'animals', icon: animalIcon, label: 'Animals' },
    { id: 'remoteControl', icon: remoteControlIcon, label: 'Remote Control' }
  ];

  return (
    <div className="fixed-sidebar">
      {menuItems.map(item => (
        <button 
          key={item.id}
          className={`sidebar-button ${activeMenu === item.id ? 'active' : ''}`}
          onClick={() => onMenuSelect(item.id)}
        >
          <img src={item.icon} alt={item.label} className="sidebar-icon" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;