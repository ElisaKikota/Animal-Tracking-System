import React from 'react';
import {
  FileText,
  Footprints,
  PawPrint,
} from 'lucide-react';

const Sidebar = ({ onMenuSelect, activeMenu }) => {
  const menuItems = [
    { id: 'reports', Icon: FileText, label: 'Reports' },
    { id: 'patrols', Icon: Footprints, label: 'Patrols' },
    { id: 'animals', Icon: PawPrint, label: 'Animals' }
  ];

  return (
    <div className="fixed-sidebar">
      {menuItems.map(item => (
        <button 
          key={item.id}
          className={`sidebar-button ${activeMenu === item.id ? 'active' : ''}`}
          onClick={() => onMenuSelect(item.id)}
          aria-label={item.label}
          aria-pressed={activeMenu === item.id}
        >
          <item.Icon className="sidebar-icon" aria-hidden="true" strokeWidth={1.8} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;