import '../styles/RealTime.css';
import "leaflet/dist/leaflet.css";
import React, { useState } from 'react';
import Reports from './RealtimeContents/Reports';
import Animals from './RealtimeContents/Animals';
import Layers from './RealtimeContents/Layers';
import Patrols from './RealtimeContents/Patrols';
import Map from './RealtimeContents/Map'; // Import the new Map component

import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';

export default function RealTime() {
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
  };

  return (
    <div className="realtime-container">
      <Sidebar
        isReportMenuVisible={isReportMenuVisible}
        isPatrolMenuVisible={isPatrolMenuVisible}
        isLayerMenuVisible={isLayerMenuVisible}
        isAnimalMenuVisible={isAnimalMenuVisible}
        toggleReportMenu={toggleReportMenu}
        togglePatrolMenu={togglePatrolMenu}
        toggleLayerMenu={toggleLayerMenu}
        toggleAnimalMenu={toggleAnimalMenu}
      />
      <Map />
      {isLayerMenuVisible && <Layers />}
      {isReportMenuVisible && <Reports />}
      {isPatrolMenuVisible && <Patrols />}
      {isAnimalMenuVisible && <Animals />}
    </div>
  );
}

const Sidebar = () => {
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
  };

  return (
    <div className="fixed-sidebar">
      <button className="sidebar-button" onClick={toggleReportMenu}>
        <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
        <span>Reports</span>
      </button>
      <button className="sidebar-button" onClick={togglePatrolMenu}>
        <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
        <span>Patrols</span>
      </button>
      <button className="sidebar-button" onClick={toggleLayerMenu}>
        <img src={layersIcon} alt="Layers" className="sidebar-icon" />
        <span>Layers</span>
      </button>
      <button className="sidebar-button" onClick={toggleAnimalMenu}>
        <img src={animalIcon} alt="Animals" className="sidebar-icon" />
        <span>Animals</span>
      </button>
    </div>
  );
};
