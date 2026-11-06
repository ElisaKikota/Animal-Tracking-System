import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import { getReportDateTime } from '../utils/reportDateUtils';
import { Binoculars, MapPin } from 'lucide-react';
import { REPORT_ICONS } from '../utils/reportIcons';

const hasValidLocation = (location) => {
  if (!location) return false;
  const latitudeValue = location.Lat ?? location.latitude;
  const longitudeValue = location.Lng ?? location.Long ?? location.longitude;
  if (latitudeValue === null || latitudeValue === undefined || latitudeValue === '' ||
      longitudeValue === null || longitudeValue === undefined || longitudeValue === '') return false;

  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
};

const ReportMenu = ({ onReportSelect, onReportLocate }) => {
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
        {filteredReports.map(report => {
          const ReportIcon = REPORT_ICONS[report.category] || Binoculars;
          const reportDateTime = getReportDateTime(report);
          return (
            <div
              key={report.id}
              className="report-item"
              onClick={() => onReportSelect(report)}
            >
              <ReportIcon className="report-image" aria-hidden="true" />
              <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
              <span className="report-day-time">
                <div>{reportDateTime.date}</div>
                <div>{reportDateTime.time}</div>
              </span>
              <button
                className="locate-icon"
                aria-label={`Locate ${report.category.replace(/_/g, ' ')} on map`}
                onClick={(event) => {
                  event.stopPropagation();
                  onReportLocate?.(report);
                }}
                disabled={!hasValidLocation(report.location)}
              >
                <MapPin className="layer-icon" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportMenu;