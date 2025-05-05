import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { Map, Filter, Settings, Download, Share } from 'lucide-react';

const Sidebar = ({ onMenuSelect, activeMenu, isMainSidebarOpen }) => {
  const menuItems = [
    { id: 'layers', icon: Map, label: 'Map Layers' },
    { id: 'filters', icon: Filter, label: 'Advanced Filters' },
    { id: 'settings', icon: Settings, label: 'Display Settings' },
    { id: 'export', icon: Download, label: 'Export Data' },
    { id: 'share', icon: Share, label: 'Share Analysis' }
  ];

  return (
    <Box className={`historical-sidebar ${isMainSidebarOpen ? 'main-sidebar-open' : ''}`}>
      {menuItems.map(item => (
        <Tooltip
          key={item.id}
          title={item.label}
          placement="right"
        >
          <button 
            className={`sidebar-button ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuSelect(item.id)}
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </button>
        </Tooltip>
      ))}
    </Box>
  );
};

export default Sidebar;