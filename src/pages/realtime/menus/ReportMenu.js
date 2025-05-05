import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import { getReportIcon } from '../utils/icons';
import locationIcon from '../../../assets/location.png';

const ReportMenu = ({ onReportSelect }) => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const reportsRef = ref(database, 'Reports');
    return onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedReports = Object.entries(data).flatMap(([category, reports]) =>
          Object.entries(reports).map(([id, report]) => ({
            id,
            category,
            ...report
          }))
        );
        setReports(formattedReports);
      }
    });
  }, []);

  const filteredReports = reports.filter(report =>
    report.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="report-menu show">
      <div className="report-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Reports</span>
        <span className="close-sign">×</span>
      </div>
      <div className="report-filters">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="report-list">
        {filteredReports.map(report => (
          <div 
            key={report.id} 
            className="report-item"
            onClick={() => onReportSelect(report)}
          >
            <img 
              src={getReportIcon(report.category)} 
              alt={report.category} 
              className="report-image" 
            />
            <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
            <span className="report-day-time">
              <div>{new Date(report.timestamp).toLocaleDateString()}</div>
              <div>{new Date(report.timestamp).toLocaleTimeString()}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="Locate" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportMenu;