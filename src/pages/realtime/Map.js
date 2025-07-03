import { ref, onValue } from 'firebase/database';
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { database } from '../../firebase';

import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';
import animalIcon from '../../assets/animal.png';
import fireIcon from '../../assets/Fire.png';
import rainfallIcon from '../../assets/Rainfall.png';
import cameraTrapIcon from '../../assets/CT_Icon_Sighting.png';
import humanWildlifeIcon from '../../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../../assets/Invasive_Species_Sighting.png';
import rhinoSightingIcon from '../../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../../assets/Wildlife_Sighting.png';

// Replace with your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2FraWtvdGEiLCJhIjoiY2x6MTkwYWRiMnE0ZTJpcjR5bzFjMzNrZyJ9.HRBoAER-bGLPEcdhbUsW_A';

const Map = ({ 
  isRealTimeMode, 
  selectedAnimalLocation, 
  mapStyle,
  showReports,
  showPatrols,
  showAnimals 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [animalData, setAnimalData] = useState([]);
  const [patrolData, setPatrolData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const markersRef = useRef({
    animals: {},
    patrols: {},
    reports: {}
  });

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [34.1677, -1.9485],
      zoom: 16
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Load all icons into the map
    const loadImage = (url, id) => {
      return new Promise((resolve, reject) => {
        map.current.loadImage(url, (error, image) => {
          if (error) reject(error);
          if (!map.current.hasImage(id)) map.current.addImage(id, image);
          resolve();
        });
      });
    };

    // Load all images before adding layers
    Promise.all([
      loadImage(elephantIcon, 'elephant-icon'),
      loadImage(lionIcon, 'lion-icon'),
      loadImage(giraffeIcon, 'giraffe-icon'),
      loadImage(rhinoIcon, 'rhino-icon'),
      loadImage(leopardIcon, 'leopard-icon'),
      loadImage(animalIcon, 'animal-icon'),
      loadImage(fireIcon, 'fire-icon'),
      loadImage(rainfallIcon, 'rainfall-icon'),
      loadImage(cameraTrapIcon, 'camera-trap-icon'),
      loadImage(humanWildlifeIcon, 'human-wildlife-icon'),
      loadImage(injuredAnimalIcon, 'injured-animal-icon'),
      loadImage(invasiveSpeciesIcon, 'invasive-species-icon'),
      loadImage(rhinoSightingIcon, 'rhino-sighting-icon'),
      loadImage(wildlifeSightingIcon, 'wildlife-sighting-icon')
    ]).then(() => {
      // Add sources
      map.current.addSource('animals', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.current.addSource('reports', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add clusters
      map.current.addLayer({
        id: 'animal-clusters',
        type: 'circle',
        source: 'animals',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            5,
            '#f1f075',
            10,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            5,
            30,
            10,
            40
          ]
        }
      });

      map.current.addLayer({
        id: 'report-clusters',
        type: 'circle',
        source: 'reports',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#ff9b9b',
            5,
            '#ff7c7c',
            10,
            '#ff5252'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            5,
            30,
            10,
            40
          ]
        }
      });

      // Add cluster counts
      map.current.addLayer({
        id: 'animal-cluster-count',
        type: 'symbol',
        source: 'animals',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      map.current.addLayer({
        id: 'report-cluster-count',
        type: 'symbol',
        source: 'reports',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Add unclustered animal points
        map.current.addLayer({
        id: 'unclustered-animal-points',
          type: 'symbol',
          source: 'animals',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': [
              'match',
              ['get', 'species'],
              'Elephants', 'elephant-icon',
              'Lions', 'lion-icon',
              'Giraffes', 'giraffe-icon',
              'Rhinos', 'rhino-icon',
              'Leopards', 'leopard-icon',
              'animal-icon' // default
            ],
          'icon-size': 0.07,
          'icon-allow-overlap': true
        }
      });

      // Add unclustered report points
      map.current.addLayer({
        id: 'unclustered-report-points',
        type: 'symbol',
        source: 'reports',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'match',
            ['get', 'category'],
            'CT_Icon_Sighting', 'camera-trap-icon',
            'Fire', 'fire-icon',
            'Human_Wildlife_Contact', 'human-wildlife-icon',
            'Injured_Animal', 'injured-animal-icon',
            'Invasive_Species_Sighting', 'invasive-species-icon',
            'Rainfall', 'rainfall-icon',
            'Rhino_Sighting', 'rhino-sighting-icon',
            'Wildlife_Sighting', 'wildlife-sighting-icon',
            'wildlife-sighting-icon' // default
          ],
          'icon-size': 0.07,
          'icon-allow-overlap': true
        }
      });

      // Add click handlers for unclustered points
      map.current.on('click', 'unclustered-animal-points', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
            .setLngLat(coordinates)
            .setHTML(`
              <div class="popup-content">
                <h3>${properties.name}</h3>
                <div class="popup-details">
                  <div class="detail-row">
                    <span class="label">Species:</span>
                    <span class="value">${properties.species}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Age:</span>
                  <span class="value">${properties.age}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Sex:</span>
                  <span class="value">${properties.sex}</span>
                  </div>
                  <div class="section-title">Last Update</div>
                  <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${properties.date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Time:</span>
                    <span class="value">${properties.time}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Activity:</span>
                  <span class="value">${properties.activity}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Temperature:</span>
                  <span class="value">${properties.temperature}°C</span>
                </div>
              </div>
            </div>
          `)
          .addTo(map.current);
      });

      map.current.on('click', 'unclustered-report-points', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="popup-content">
              <h3>${properties.title}</h3>
              <div class="popup-details">
                <div class="detail-row">
                  <span class="label">Category:</span>
                  <span class="value">${properties.category}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Reported:</span>
                  <span class="value">${new Date(properties.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            `)
            .addTo(map.current);
      });

      // Change cursor on hover for unclustered points
      map.current.on('mouseenter', 'unclustered-animal-points', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-animal-points', () => {
        map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-report-points', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-report-points', () => {
        map.current.getCanvas().style.cursor = '';
      });

      // Handle cluster clicks
      map.current.on('click', 'animal-clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['animal-clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('animals').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      map.current.on('click', 'report-clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['report-clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('reports').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'animal-clusters', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'animal-clusters', () => {
        map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'report-clusters', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'report-clusters', () => {
        map.current.getCanvas().style.cursor = '';
      });
    }).catch(console.error);

    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  // Fetch animal data
  useEffect(() => {
    if (!database) {
      console.error('Database is not initialized');
      return;
    }

    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = {};  // Use an object to track all animals by ID

    console.log('Starting to fetch animal data...');

    // Create a separate listener for each species
    const unsubscribes = animalSpecies.map(species => {
        const speciesRef = ref(database, `Animals/${species}`);
        console.log(`Setting up listener for ${species}`);
      return onValue(speciesRef, (snapshot) => {
          const data = snapshot.val();
          console.log(`Received data for ${species}:`, data);
          if (data) {
            Object.entries(data).forEach(([id, animal]) => {
            const latestDate = Object.keys(animal.location || {}).sort().pop();
            const latestTime = latestDate ? Object.keys(animal.location[latestDate]).sort().pop() : null;
            
            if (latestDate && latestTime) {
                const location = animal.location[latestDate][latestTime];
              fetchedData[`${species}-${id}`] = {
                id: `${species}-${id}`,
                species,
                    name: animal.name,
                age: animal.age,
                    sex: animal.sex,
                date: latestDate,
                time: latestTime,
                    location: {
                      Lat: parseFloat(location.Lat),
                  Lng: parseFloat(location.Long),
                  activity: location.activity,
                  temperature: location.temperature
                }
              };
              // Update state with all accumulated data
              setAnimalData(Object.values(fetchedData));
            }
          });
        } else {
          console.log(`No data found for ${species}`);
        }
      }, (error) => {
        console.error(`Error fetching data for ${species}:`, error);
        if (error.code === 'PERMISSION_DENIED') {
          console.error('Permission denied. Check your database rules.');
        } else if (error.code === 'UNAVAILABLE') {
          console.error('Database is unavailable. Check your internet connection and Firebase project status.');
        }
      });
    });

    // Cleanup function to unsubscribe all listeners
    return () => {
      console.log('Cleaning up animal data listeners');
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Fetch patrol data
  useEffect(() => {
    const patrolRef = ref(database, 'PatrolOfficers');
    onValue(patrolRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patrolArray = Object.entries(data)
          .filter(([_, patrol]) => patrol && patrol.location && patrol.location.Lat && patrol.location.Long)
          .map(([id, patrol]) => ({
            id,
            name: patrol.name || 'Unknown Officer',
            status: patrol.status || 'Unknown',
            timestamp: patrol.timestamp || Date.now(),
            location: {
              Lat: parseFloat(patrol.location.Lat),
              Lng: parseFloat(patrol.location.Long)
            }
          }));
        setPatrolData(patrolArray);
      }
    });
  }, []);

  // Fetch report data
  useEffect(() => {
    const reportCategories = [
      'CT_Icon_Sighting',
      'Fire',
      'Human_Wildlife_Contact',
      'Injured_Animal',
      'Invasive_Species_Sighting',
      'Rainfall',
      'Rhino_Sighting',
      'Wildlife_Sighting'
    ];

    const fetchedReports = {};  // Use an object to track all reports by ID

    // Create a separate listener for each category
    const unsubscribes = reportCategories.map(category => {
      const reportsRef = ref(database, `Reports/${category}`);
      return onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.entries(data)
            .filter(([_, report]) => report && report.location && report.location.Lat && report.location.Long)
            .forEach(([id, report]) => {
              fetchedReports[`${category}-${id}`] = {
                id: `${category}-${id}`,
                title: report.title || 'Untitled Report',
                category,
                timestamp: report.timestamp || Date.now(),
                location: {
                  Lat: parseFloat(report.location.Lat),
                  Lng: parseFloat(report.location.Long)
                }
              };
              // Update state with all accumulated data
              setReportData(Object.values(fetchedReports));
            });
        }
      });
    });

    // Cleanup function to unsubscribe all listeners
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Update animal source data
  useEffect(() => {
    if (!map.current || !map.current.loaded() || !map.current.getSource('animals')) return;

    const features = animalData.map(animal => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [animal.location.Lng, animal.location.Lat]
        },
        properties: {
          id: animal.id,
          name: animal.name,
          species: animal.species,
          age: animal.age,
          sex: animal.sex,
          date: animal.date,
          time: animal.time,
          activity: animal.location.activity,
          temperature: animal.location.temperature
        }
    }));

    if (showAnimals) {
      map.current.getSource('animals').setData({
        type: 'FeatureCollection',
        features: features
      });
    } else {
      map.current.getSource('animals').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [animalData, showAnimals]);

  // Update report source data
  useEffect(() => {
    if (!map.current || !map.current.loaded() || !map.current.getSource('reports')) return;

    const features = reportData.map(report => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [report.location.Lng, report.location.Lat]
      },
      properties: {
        id: report.id,
        title: report.title,
        category: report.category,
        timestamp: report.timestamp
      }
    }));

    if (showReports) {
      map.current.getSource('reports').setData({
        type: 'FeatureCollection',
        features: features
      });
    } else {
      map.current.getSource('reports').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [reportData, showReports]);

  // Handle patrol markers
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    // Remove existing patrol markers
    Object.values(markersRef.current.patrols).forEach(marker => marker.remove());
    markersRef.current.patrols = {};

    if (showPatrols) {
      patrolData.forEach(patrol => {
        if (patrol.location) {
          const el = document.createElement('div');
          el.className = 'marker patrol-marker';
          
          const marker = new mapboxgl.Marker(el)
            .setLngLat([patrol.location.Lng, patrol.location.Lat])
            .setPopup(new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
              .setHTML(`
                <div class="popup-content">
                  <h3>${patrol.name}</h3>
                  <div class="popup-details">
                    <div class="detail-row">
                      <span class="label">Status:</span>
                      <span class="value">${patrol.status}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Last update:</span>
                      <span class="value">${new Date(patrol.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              `))
            .addTo(map.current);

          markersRef.current.patrols[patrol.id] = marker;
        }
      });
    }
  }, [patrolData, showPatrols]);

  return (
    <>
      <style>
        {`
          .marker {
            background-size: contain;
            background-repeat: no-repeat;
            width: 16px;
            height: 16px;
            cursor: pointer;
          }

          .animal-marker {
            background-image: url(${animalIcon});
          }

          .animal-marker.elephants {
            background-image: url(${elephantIcon});
          }

          .animal-marker.lions {
            background-image: url(${lionIcon});
          }

          .animal-marker.giraffes {
            background-image: url(${giraffeIcon});
          }

          .animal-marker.rhinos {
            background-image: url(${rhinoIcon});
          }

          .animal-marker.leopards {
            background-image: url(${leopardIcon});
          }

          .report-marker {
            background-size: contain;
            background-repeat: no-repeat;
            width: 16px;
            height: 16px;
            cursor: pointer;
          }

          .report-marker.ct_icon_sighting {
            background-image: url(${cameraTrapIcon});
          }

          .report-marker.fire {
            background-image: url(${fireIcon});
          }

          .report-marker.human_wildlife_contact {
            background-image: url(${humanWildlifeIcon});
          }

          .report-marker.injured_animal {
            background-image: url(${injuredAnimalIcon});
          }

          .report-marker.invasive_species_sighting {
            background-image: url(${invasiveSpeciesIcon});
          }

          .report-marker.rainfall {
            background-image: url(${rainfallIcon});
          }

          .report-marker.rhino_sighting {
            background-image: url(${rhinoSightingIcon});
          }

          .report-marker.wildlife_sighting {
            background-image: url(${wildlifeSightingIcon});
          }

          .patrol-marker {
            background-color: #2ecc71;
            border-radius: 50%;
            border: 2px solid white;
            width: 12px;
            height: 12px;
          }

          .custom-popup {
            background: transparent !important;
            border: none !important;
            border-radius: 6px !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 200px !important;
          }

          .custom-popup .mapboxgl-popup-content {
            background: linear-gradient(135deg, rgba(31, 118, 206, 0.8), rgba(31, 118, 206, 0.9)) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 6px !important;
            padding: 8px 12px !important;
            color: white !important;
          }

          .custom-popup .mapboxgl-popup-tip {
            display: none !important;
          }

          .popup-content h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 4px;
            color: white;
          }

          .popup-details {
            font-size: 12px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }

          .section-title {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            margin: 8px 0 4px 0;
            font-size: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 2px;
          }

          .label {
            color: rgba(255, 255, 255, 0.8);
            margin-right: 12px;
          }

          .value {
            color: white;
            font-weight: 500;
          }
        `}
      </style>
      <div ref={mapContainer} className="map" />
    </>
  );
};

export default Map;