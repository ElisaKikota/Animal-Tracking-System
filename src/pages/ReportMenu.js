import React, { useState, useMemo, useEffect } from 'react';
import '../styles/RealTime.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

import FireIcon from '../assets/Fire.png'
import HumanWildlifeContactIcon from '../assets/Human_Wildlife_Contact.png'
import InjuredAnimalIcon from '../assets/Injured_Animal.png'
import InvasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png'
import RainfallIcon from '../assets/Rainfall.png'
import RhinoSightingIcon from '../assets/Rhino_Sighting.png'
import WildlifeSightingIcon from '../assets/Wildlife_Sighting.png'
import locationIcon from '../assets/location.png'
import CTIcon from '../assets/CT_Icon_Sighting.png';

const ReportMenu = ({ isReportMenuVisible, toggleReportMenu, reportData, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [displayedReports, setDisplayedReports] = useState([]);

  const filteredAndSortedReports = useMemo(() => {
    return reportData
      .filter(report => 
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        const dateA = new Date(a.day);
        const dateB = new Date(b.day);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [reportData, searchTerm, sortOrder]);

  useEffect(() => {
    setDisplayedReports(filteredAndSortedReports.slice(0, 10));
  }, [filteredAndSortedReports]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const loadMoreReports = () => {
    setDisplayedReports(prevReports => [
      ...prevReports,
      ...filteredAndSortedReports.slice(prevReports.length, prevReports.length + 10)
    ]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset displayed reports when search term changes
    setDisplayedReports([]); 
  };

  return (
    <div id="report-menu" className={`report-menu ${isReportMenuVisible ? 'show' : 'hide'}`}>
      <div className="report-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Reports</span>
        <span className="close-sign" onClick={toggleReportMenu}>x</span>
      </div>
      <div className="report-filters">
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-bar" 
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="date-updated-btn" onClick={toggleSortOrder}>
          {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          Date Updated
        </button>
      </div>
      <div className="report-summary">
        <span>{filteredAndSortedReports.length} results</span>
      </div>
      <div className="report-list">
        {displayedReports.map((report) => (
          <div
            key={report.id}
            className="report-item"
            onClick={() => openModal(report)}
          >
            <img src={getReportIcon(report.category)} alt="report" className="report-image" />
            <span className="entry-number">{report.id}</span>
            <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
            <span className="report-day-time">
              <div className="report-date">{formatDate(report.day)}</div>
              <div className="report-time">{formatTime(report.time)}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="locationIcon" className="layer-icon" />
            </button>
          </div>
        ))}
        {displayedReports.length < filteredAndSortedReports.length && (
          <button onClick={loadMoreReports} className="load-more-btn">Load More</button>
        )}
      </div>
    </div>
  );
};

const getReportIcon = (category) => {
  switch(category) {
    case 'CT_Icon_Sighting': return CTIcon;
    case 'Fire': return FireIcon;
    case 'Human_Wildlife_Contact': return HumanWildlifeContactIcon;
    case 'Injured_Animal': return InjuredAnimalIcon;
    case 'Invasive_Species_Sighting': return InvasiveSpeciesIcon;
    case 'Rainfall': return RainfallIcon;
    case 'Rhino_Sighting': return RhinoSightingIcon;
    default: return WildlifeSightingIcon;
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default ReportMenu;