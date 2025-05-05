import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import locationIcon from '../../../assets/location.png';
import elephantIcon from '../../../assets/elephant.png';
import lionIcon from '../../../assets/lion.png';
import giraffeIcon from '../../../assets/giraffe.png';
import rhinoIcon from '../../../assets/rhino.png';
import leopardIcon from '../../../assets/leopard.png';

const AnimalMenu = ({ onAnimalLocationSelect }) => {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const getSpeciesIcon = (species) => {
    const speciesLower = species.toLowerCase();
    if (speciesLower.includes('elephant')) return elephantIcon;
    if (speciesLower.includes('lion')) return lionIcon;
    if (speciesLower.includes('giraffe')) return giraffeIcon;
    if (speciesLower.includes('rhino')) return rhinoIcon;
    if (speciesLower.includes('leopard')) return leopardIcon;
    return elephantIcon;
  };

  useEffect(() => {
    const fetchAnimalData = async () => {
      const speciesList = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
      const animalData = [];

      speciesList.forEach(species => {
        const speciesRef = ref(database, `Animals/${species}`);
        onValue(speciesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.entries(data).forEach(([id, animal]) => {
              const latestDate = Object.keys(animal.location || {}).sort().pop();
              const latestTime = latestDate ? Object.keys(animal.location[latestDate]).sort().pop() : null;
              
              if (latestDate && latestTime) {
                const location = animal.location[latestDate][latestTime];
                animalData.push({
                  id,
                  species,
                  icon: getSpeciesIcon(species),
                  name: animal.name,
                  date: latestDate,
                  time: latestTime,
                  location: {
                    Lat: parseFloat(location.Lat),
                    Lng: parseFloat(location.Long)
                  }
                });
              }
            });
            setAnimals([...animalData]);
          }
        });
      });
    };

    fetchAnimalData();
  }, []);

  const handleLocationClick = (animal) => {
    onAnimalLocationSelect(animal.location);
  };

  const filteredAnimals = animals.filter(animal =>
    animal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animal-menu show">
      <div className="animal-header">
        <span className="plus-sign">+</span>
        <span className="animal-title">Animals</span>
        <span className="close-sign">×</span>
      </div>
      <div className="animal-filters">
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
      <div className="animal-summary">
        <span>{filteredAnimals.length} results</span>
      </div>
      <div className="animal-list">
        {filteredAnimals.map((animal) => (
          <div key={animal.id} className="animal-item">
            <img
              src={animal.icon}
              alt={animal.species}
              className="animal-image"
            />
            <span className="entry-number">{animal.id}</span>
            <span className="animal-name">{animal.name}</span>
            <span className="animal-day-time">
              <div>{animal.date}</div>
              <div>{animal.time}</div>
            </span>
            <button 
              className="locate-icon"
              onClick={() => handleLocationClick(animal)}
            >
              <img src={locationIcon} alt="Locate" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalMenu;