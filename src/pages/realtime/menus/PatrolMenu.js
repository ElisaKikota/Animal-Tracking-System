import React from 'react';
import patrolsIcon from '../../../assets/patrols.png';
import locationIcon from '../../../assets/location.png';

const PatrolMenu = () => {
  return (
    <div className="patrol-menu show">
      <div className="patrol-header">
        <span className="plus-sign">+</span>
        <span className="patrol-title">Patrol Officers</span>
        <span className="close-sign">×</span>
      </div>
      <div className="patrol-filters">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="patrol-list">
        <div className="patrol-item">
          <img src={patrolsIcon} alt="patrol" className="patrol-image" />
          <span className="entry-number">1</span>
          <span className="patrol-name">Elisa Kikota</span>
          <span className="patrol-day-time">
            <div>9th Aug 2024</div>
            <div>12:30 PM</div>
          </span>
          <button className="locate-icon">
            <img src={locationIcon} alt="Locate" className="layer-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatrolMenu;
