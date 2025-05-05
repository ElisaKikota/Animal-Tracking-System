import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../firebase';
import Map from './Map';
import Sidebar from './Sidebar';
import MapControls from './MapControls';
import LayerMenu from './menus/LayerMenu';
import ReportMenu from './menus/ReportMenu';
import PatrolMenu from './menus/PatrolMenu';
import AnimalMenu from './menus/AnimalMenu';
import RemoteControlMenu from './menus/RemoteControlMenu';
import ReportModal from './modals/ReportModals';
import '../../styles/RealTime.css';

const RealTime = () => {
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [showReports, setShowReports] = useState(true);
  const [showPatrols, setShowPatrols] = useState(true);
  const [showAnimals, setShowAnimals] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState('default');

  // Initialize control states from database
  useEffect(() => {
    const controlsRef = ref(database, 'Controls');
    
    // Set initial control states if they don't exist
    onValue(controlsRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(controlsRef, {
          trackingMode: 'lastKnown',
          showReports: true,
          showPatrols: true,
          showAnimals: true
        });
      }
    }, { onlyOnce: true });
  }, []);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleAnimalLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleLayerChange = (style) => {
    setMapStyle(style);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  const handleToggleRealTime = (value) => {
    setIsRealTimeMode(value);
  };

  const handleToggleReports = (value) => {
    setShowReports(value);
  };

  const handleTogglePatrols = (value) => {
    setShowPatrols(value);
  };

  const handleToggleAnimals = (value) => {
    setShowAnimals(value);
  };

  return (
    <div className="realtime-container">
      <Sidebar 
        onMenuSelect={toggleMenu} 
        activeMenu={activeMenu}
      />
      
      <MapControls
        isRealTimeMode={isRealTimeMode}
        showReports={showReports}
        showPatrols={showPatrols}
        showAnimals={showAnimals}
        onToggleRealTime={handleToggleRealTime}
        onToggleReports={handleToggleReports}
        onTogglePatrols={handleTogglePatrols}
        onToggleAnimals={handleToggleAnimals}
      />

      <Map 
        isRealTimeMode={isRealTimeMode} 
        selectedAnimalLocation={selectedLocation}
        mapStyle={mapStyle}
        showReports={showReports}
        showPatrols={showPatrols}
        showAnimals={showAnimals}
      />
      
      {activeMenu === 'layers' && (
        <LayerMenu onLayerChange={handleLayerChange} />
      )}
      
      {activeMenu === 'reports' && (
        <ReportMenu onReportSelect={handleReportSelect} />
      )}
      
      {activeMenu === 'patrols' && (
        <PatrolMenu />
      )}
      
      {activeMenu === 'animals' && (
        <AnimalMenu onAnimalLocationSelect={handleAnimalLocationSelect} />
      )}
      
      {activeMenu === 'remoteControl' && (
        <RemoteControlMenu />
      )}
      
      {selectedReport && (
        <ReportModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};

export default RealTime;