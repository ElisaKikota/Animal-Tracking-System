import React from 'react';
import patrolsIcon from '../../assets/patrols.png';
import locationIcon from '../../assets/location.png';
import '../../styles/RealTime.css';

export default function Patrols({ isVisible, togglePatrolMenu }) {
  if (!isVisible) return null;

  return (
    <div id="patrol-menu" className={`patrol-menu ${isVisible ? 'show' : 'hide'}`}>
      <div className="patrol-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Patrol Officers</span>
        <span className="close-sign" onClick={togglePatrolMenu}>x</span>
      </div>
      <div className="patrol-filters">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
        <button className="date-updated-btn">Date Updated</button>
      </div>
      <div className="patrol-summary">
        <span>1 result from about <b>{/* time logic here */} ago until now</b></span>
      </div>
      <div className="patrol-list">
        <div className="patrol-item">
          <img src={patrolsIcon} alt="patrol" className="patrol-image" />
          <span className="entry-number">1</span>
          <span className="report-name">Elisa Kikota</span>
          <span className="report-day-time">
            <div className="patrol-date">9th Aug 2024</div>
            <div className="patrol-time">12:30 PM</div>
          </span>
          <button className="locate-icon"><img src={locationIcon} alt="locationIcon" className="layer-icon" /></button>
        </div>
        {/* Repeat for other patrol officers */}
      </div>
    </div>
  );
}
