import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';
import elephantIcon from '../assets/elephant.png';
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';
import locationIcon from '../assets/location.png';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, divIcon } from 'leaflet';
import '../styles/RealTime.css';

const RealTime = () => {
  const [animalData, setAnimalData] = useState([]);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);

  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    
    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];
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
          };
        });

        setAnimalData((prevData) => [...prevData, ...animalArray]);
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  const createCustomClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster",
    });
  };

  const createMarkerIcon = (species) => {
    let iconUrl;
    switch (species) {
      case 'Elephant':
        iconUrl = elephantIcon;
        break;
      case 'Lion':
        iconUrl = lionIcon;
        break;
      case 'Giraffe':
        iconUrl = giraffeIcon;
        break;
      case 'Rhino':
        iconUrl = rhinoIcon;
        break;
      case 'Leopard':
        iconUrl = leopardIcon;
        break;
      default:
        iconUrl = animalIcon;
        break;
    }
    return new Icon({
      iconUrl,
      iconSize: [38, 38],
    });
  };

  const toggleMenu = (menuSetter) => {
    menuSetter(prev => !prev);
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  return (
    <div className="realtime-container">
      <MapContainer center={[34.166586, -1.948311]} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createCustomClusterIcon}
        >
          {animalData.map(animal => (
            <Marker key={animal.id} position={[animal.location.Lat, animal.location.Lng]} icon={createMarkerIcon(animal.species)}>
              <Popup>
                <div>
                  <strong>{animal.species}</strong><br />
                  Sex: {animal.sex}<br />
                  Age: {animal.age} years<br />
                  Date: {animal.date}<br />
                  Time: {animal.time}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* <div className="fixed-sidebar">
        <button className="sidebar-button" onClick={() => toggleMenu(setIsReportMenuVisible)}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={() => toggleMenu(setIsPatrolMenuVisible)}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={() => toggleMenu(setIsLayerMenuVisible)}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={() => toggleMenu(setIsAnimalMenuVisible)}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
      </div> */}
    </div>
  );
};

export default RealTime;
