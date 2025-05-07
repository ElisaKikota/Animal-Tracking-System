import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, Users, PawPrint, Database, Lock, LogOut, History } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isSidebarOpen, setCurrentPage }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: '/', text: 'Welcome', icon: Home },
    { path: '/real_time', text: 'Real Time', icon: Clock },
    { path: '/analysis', text: 'Analysis', icon: History },
    { path: '/analysis_data', text: 'Analysis Data', icon: Database },
    { path: '/view_users', text: 'View Users', icon: Users },
    { path: '/view_animals', text: 'View Animals', icon: PawPrint },
    { path: '/change_password', text: 'Change Password', icon: Lock },
    { path: '/signout', text: 'Signout', icon: LogOut },
  ];

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <ul>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path || 
            (currentPath === '' && item.path === '/');
          
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={() => setCurrentPage && setCurrentPage(item.path)}
                className={isActive ? 'active' : ''}
              >
                <item.icon size={24} />
                <span>{item.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;