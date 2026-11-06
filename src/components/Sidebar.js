import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, Users, PawPrint, Database, LogOut, History, Brain } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isSidebarOpen, onNavigate }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: '/', text: 'Dashboard', icon: Home },
    { path: '/real_time', text: 'Real Time', icon: Clock },
    { path: '/analysis', text: 'Analysis', icon: History },
    { path: '/analysis_data', text: 'Analysis Data', icon: Database },
    { path: '/models', text: 'Models', icon: Brain },
    { path: '/view_users', text: 'View Users', icon: Users },
    { path: '/view_animals', text: 'View Animals', icon: PawPrint },
  ];

  return (
    <nav
      id="primary-navigation"
      className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
      aria-label="Primary navigation"
    >
      <ul className="menu-items">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path || 
            (currentPath === '' && item.path === '/');
          
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={onNavigate}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'page' : undefined}
                title={!isSidebarOpen ? item.text : undefined}
              >
                <item.icon size={24} />
                <span>{item.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="signout-button">
        <button
          type="button"
          title={!isSidebarOpen ? 'Signout' : undefined}
        >
          <LogOut size={24} />
          <span>Signout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;