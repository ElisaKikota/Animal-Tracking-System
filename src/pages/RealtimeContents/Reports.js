import React, { useState, useEffect } from 'react';
import reportsIcon from '../../assets/reports.png';
import locationIcon from '../../assets/location.png';
import '../../styles/RealTime.css';

export default function ReportMenu({ isVisible, toggleReportMenu, reportData, openModal }) {
  const [sortedReports, setSortedReports] = useState([]);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    setSortedReports(reportData);
  }, [reportData]);

  const handleSort = (criteria) => {
    let sorted = [...sortedReports];
    if (criteria === 'dateUpdated') {
      sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    setSortedReports(sorted);
    setSortBy(criteria);
  };

  if (!isVisible) return null;

  return (
    <div id="report-menu" className={`report-menu ${isVisible ? 'show' : 'hide'}`}>
      <div className="report-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Reports</span>
        <span className="close-sign" onClick={toggleReportMenu}>x</span>
      </div>
      <div className="report-filters">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
        <button 
          className={`date-updated-btn ${sortBy === 'dateUpdated' ? 'active' : ''}`}
          onClick={() => handleSort('dateUpdated')}
        >
          Date Updated
        </button>
      </div>
      <div className="report-summary">
        <span>{sortedReports.length} results</span>
      </div>
      <div className="report-list">
        {sortedReports.map((report) => (
          <div key={report.id} className="report-item" onClick={() => openModal(report)}>
            <img src={reportsIcon} alt="Report" className="report-image" />
            <span className="entry-number">{report.id}</span>
            <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
            <span className="report-day-time">
              <div className="report-date">{new Date(report.timestamp).toLocaleDateString()}</div>
              <div className="report-time">{new Date(report.timestamp)}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="locationIcon" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}