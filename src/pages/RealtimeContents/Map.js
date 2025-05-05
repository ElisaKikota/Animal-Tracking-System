import { ref, onValue } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon } from "leaflet";
import React, { useEffect, useState } from 'react';

import { database } from '../../firebase';  // Import the database

import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';
import animalIcon from '../../assets/animal.png'; // Fallback icon

const Map = () => {
  const [animalData, setAnimalData] = useState([]); // Define local state

  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = [];
  
    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);  // Use the imported database
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];
  
          const temp = location.temperature || 'N/A';
          const activity = location.activity || 'N/A';
  
          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            date: latestTimestamp,
            time: latestTime,
            temp: temp, 
            activity: activity, 
          };
        });
        fetchedData.push(...animalArray);
        setAnimalData(fetchedData);
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  return (
    <MapContainer className="map" center={[-1.948, 34.1665]} zoom={16}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup chunkedLoading>
        {animalData.map(animal => {
          const speciesIcon = new Icon({
            iconUrl: 
              animal.species.toLowerCase() === 'elephant' ? elephantIcon :
              animal.species.toLowerCase() === 'lion' ? lionIcon :
              animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
              animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
              animal.species.toLowerCase() === 'leopard' ? leopardIcon :
              animalIcon, 
            iconSize: [38, 38]
          });

          return (
            <Marker 
              key={animal.id}
              position={[animal.location.Lat, animal.location.Lng]} 
              icon={speciesIcon}
            >
              <Popup>
                <div style={{ padding: '0px', borderRadius: '1px' }}>
                  <strong>{animal.name}</strong><br />
                  Sex: {animal.sex}<br />
                  Age: {animal.age} years<br />
                  Temp: {animal.temp} °C<br /> 
                  Activity: {animal.activity}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
