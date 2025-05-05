import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Welcome from './pages/Welcome';
import RealTime from './pages/realtime/index';
import HistoricalPatterns from './pages/historical/HistoricalPatterns';
import ViewUsers from './pages/ViewUsers';
import ViewAnimals from './pages/ViewAnimals';
import Analysis from './pages/Analysis';
import ChangePassword from './pages/ChangePassword';
import './App.css';
import './styles/Transitions.css';

const pageOrder = [
  '/welcome',
  '/real_time',
  '/historical_patterns',
  '/view_users',
  '/view_animals',
  '/analysis',
  '/change_password',
  '/signout'
];

const AppContent = () => {
  const location = useLocation();
  const prevLocationRef = useRef(location);
  const [direction, setDirection] = useState('up');

  useEffect(() => {
    const prevIndex = pageOrder.indexOf(prevLocationRef.current.pathname);
    const currentIndex = pageOrder.indexOf(location.pathname);

    if (currentIndex > prevIndex) {
      setDirection('up');
    } else if (currentIndex < prevIndex) {
      setDirection('down');
    }

    prevLocationRef.current = location;
  }, [location]);

  // Update document title based on current route
  useEffect(() => {
    const path = location.pathname;
    let title = 'AI-Powered Animal Tracking System';
    
    switch(path) {
      case '/':
      case '/welcome':
        title = 'Welcome | Animal Tracking';
        break;
      case '/real_time':
        title = 'Real Time Tracking | Animal Tracking';
        break;
      case '/historical_patterns':
        title = 'Historical Patterns | Animal Tracking';
        break;
      case '/view_users':
        title = 'View Users | Animal Tracking';
        break;
      case '/view_animals':
        title = 'View Animals | Animal Tracking';
        break;
      case '/analysis':
        title = 'Analysis Data | Animal Tracking';
        break;
      case '/change_password':
        title = 'Change Password | Animal Tracking';
        break;
      case '/signout':
        title = 'Sign Out | Animal Tracking';
        break;
      default:
        title = 'AI-Powered Animal Tracking System';
    }
    
    document.title = title;
  }, [location]);

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        timeout={{ enter: 300, exit: 300 }}
        classNames={`page-${direction}`}
      >
        <Routes location={location}>
          <Route path="/" element={<Welcome />} />
          <Route path="/real_time" element={<RealTime />} />
          <Route path="/historical_patterns" element={<HistoricalPatterns />} />
          <Route path="/view_users" element={<ViewUsers />} />
          <Route path="/view_animals" element={<ViewAnimals />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/change_password" element={<ChangePassword />} />
          <Route path="/signout" element={<div>Signout Page</div>} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className="content-container">
          <AppContent />
        </div>
      </div>
    </Router>
  );
}

export default App;