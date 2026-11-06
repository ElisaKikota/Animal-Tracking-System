import React, { useState } from 'react';
import { Footprints, MapPin } from 'lucide-react';

const PatrolMenu = ({ patrols = [], onPatrolLocate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPatrols = patrols.filter((patrol) =>
    patrol.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patrol-menu show">
      <div className="patrol-header">
        <span className="plus-sign">+</span>
        <span className="patrol-title">Patrol Officers</span>
        <span className="close-sign">×</span>
      </div>
      <div className="patrol-filters">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="patrol-list">
        {filteredPatrols.length === 0 ? (
          <p className="patrol-empty-state">
            {patrols.length === 0
              ? 'No patrol officer locations are available.'
              : 'No patrol officers match your search.'}
          </p>
        ) : filteredPatrols.map((patrol, index) => (
          <div className="patrol-item" key={patrol.id}>
            <Footprints className="patrol-image" aria-hidden="true" />
            <span className="entry-number">{index + 1}</span>
            <span className="patrol-name">{patrol.name}</span>
            <span className="patrol-day-time">
              <div>{patrol.status}</div>
              <div>{patrol.date}</div>
              <div>{patrol.time}</div>
            </span>
            <button
              className="locate-icon"
              aria-label={`Locate ${patrol.name} on map`}
              onClick={() => onPatrolLocate?.(patrol)}
            >
              <MapPin className="layer-icon" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatrolMenu;
