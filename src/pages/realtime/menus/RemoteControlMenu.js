import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../../firebase';
import locationIcon from '../../../assets/location.png';
import elephantIcon from '../../../assets/elephant.png';
import lionIcon from '../../../assets/lion.png';
import giraffeIcon from '../../../assets/giraffe.png';
import rhinoIcon from '../../../assets/rhino.png';
import leopardIcon from '../../../assets/leopard.png';

const RemoteControlMenu = () => {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const animalsRef = ref(database, 'Animals');
    return onValue(animalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedAnimals = Object.entries(data).flatMap(([species, animals]) =>
          Object.entries(animals).map(([id, animal]) => ({
            id,
            species,
            ...animal
          }))
        );
        setAnimals(formattedAnimals);
      }
    });
  }, []);

  const handleIntervalChange = (animalId, species, newInterval) => {
    const animalRef = ref(database, `Animals/${species}/${animalId}`);
    update(animalRef, { upload_interval: parseInt(newInterval) || 0 });
  };

  return (
    <div className="remote-control-menu show">
      <div className="remote-control-header">
        <span className="plus-sign">+</span>
        <span className="remote-control-title">Remote Control Tag</span>
        <span className="close-sign">×</span>
      </div>
      <div className="remote-control-filters">
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
      <div className="remote-control-list">
        {animals.map(animal => (
          <div key={animal.id} className="animal-item">
            <img 
              src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                animal.species.toLowerCase() === 'lion' ? lionIcon :
                animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                giraffeIcon // Default for giraffe and others
              }
              alt={animal.species} 
              className="animal-image" 
            />
            <span className="entry-number">{animal.id}</span>
            <span className="animal-name">{animal.name}</span>
            <input
              type="number"
              className="interval-input"
              value={animal.upload_interval || 0}
              onChange={(e) => handleIntervalChange(animal.id, animal.species, e.target.value)}
            />
            <span className="animal-day-time">
              <div>{animal.date}</div>
              <div>{animal.time}</div>
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

export default RemoteControlMenu;