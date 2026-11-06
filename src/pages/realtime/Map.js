import { ref, onValue } from 'firebase/database';
import React, { useEffect, useState, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ShieldCheck, UserRound } from 'lucide-react';
import { database } from '../../firebase';
import { extractLocationHistory } from './utils/scienceUtils';
import { getAnimalSpeciesIconDataUrl } from './utils/animalSpeciesIcons';
import { getReportDateTime, getReportTimestamp } from './utils/reportDateUtils';
import {
  getReportMapIconDataUrl,
  getReportMapIconId,
  REPORT_ICONS,
} from './utils/reportIcons';
import { getLatestPatrolLocation, getPatrolStatus } from './utils/patrolUtils';
import { isWithinLastHour } from './utils/locationFreshness';
import './Map.css';

// Replace with your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2FraWtvdGEiLCJhIjoiY2x6MTkwYWRiMnE0ZTJpcjR5bzFjMzNrZyJ9.HRBoAER-bGLPEcdhbUsW_A';

const Map = ({
  isRealTimeMode,
  selectedAnimalLocation,
  mapStyle,
  showReports,
  showPatrols,
  showAnimals,
  onPatrolDataChange,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const currentMapStyle = useRef('mapbox/outdoors-v11');
  const styleLoadGeneration = useRef(0);
  const mapInteractionsRegistered = useRef(false);
  const [animalData, setAnimalData] = useState([]);
  const [patrolData, setPatrolData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const markersRef = useRef({
    animals: {},
    patrols: {},
    reports: {}
  });
  const [predictionMode, setPredictionMode] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [historicalPath, setHistoricalPath] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [predictedPath, setPredictedPath] = useState([]);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const baseStyle = 'mapbox/outdoors-v11';
    currentMapStyle.current = baseStyle;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/${baseStyle}`,
      center: [34.1677, -1.9485],
      zoom: 16,
      customAttribution: 'Animal icons: Twemoji (CC BY 4.0)',
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('style.load', async () => {
      const generation = ++styleLoadGeneration.current;
      const speciesIcons = [
        ['Elephants', 'animal-elephant'],
        ['Giraffes', 'animal-giraffe'],
        ['Lions', 'animal-lion'],
        ['Leopards', 'animal-leopard'],
        ['Rhinos', 'animal-rhino'],
      ];

      try {
        await Promise.all(speciesIcons.map(([species, imageId]) => new Promise((resolve, reject) => {
          const iconUrl = getAnimalSpeciesIconDataUrl(species);
          const image = new Image();
          image.onload = () => {
            if (!map.current || generation !== styleLoadGeneration.current) {
              resolve();
              return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d');
            if (!context) {
              reject(new Error(`Unable to create a canvas for ${species} map icon`));
              return;
            }
            context.drawImage(image, 0, 0);
            if (!map.current.hasImage(imageId)) {
              map.current.addImage(imageId, context.getImageData(0, 0, canvas.width, canvas.height));
            }
            resolve();
          };
          image.onerror = () => reject(new Error(`Unable to load map icon for ${species}`));
          image.src = iconUrl;
        })));
      } catch (error) {
        console.error('Unable to load animal species map icons:', error);
        return;
      }

      try {
        await Promise.all(Object.keys(REPORT_ICONS).map((category) => new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            if (!map.current || generation !== styleLoadGeneration.current) {
              resolve();
              return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d');
            if (!context) {
              reject(new Error(`Unable to create a canvas for ${category} report icon`));
              return;
            }
            context.drawImage(image, 0, 0);
            const imageId = getReportMapIconId(category);
            if (!map.current.hasImage(imageId)) {
              map.current.addImage(
                imageId,
                context.getImageData(0, 0, canvas.width, canvas.height)
              );
            }
            resolve();
          };
          image.onerror = () => reject(new Error(`Unable to load ${category} report icon`));
          image.src = getReportMapIconDataUrl(category);
        })));
      } catch (error) {
        console.error('Unable to load report map icons:', error);
        return;
      }

      if (!map.current || generation !== styleLoadGeneration.current) return;

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

      map.current.addSource('animals-heatmap', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
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
        id: 'animal-heatmap',
        type: 'heatmap',
        source: 'animals-heatmap',
        layout: {
          visibility: 'none',
        },
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            0.7,
            15,
            2,
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            14,
            15,
            30,
          ],
          'heatmap-opacity': 0.8,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            0.2,
            '#67a9cf',
            0.4,
            '#f7f7a1',
            0.6,
            '#fdae61',
            1,
            '#d7191c',
          ],
        },
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

      map.current.addLayer({
        id: 'unclustered-animal-points',
        type: 'symbol',
        source: 'animals',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'match',
            ['get', 'species'],
            'Elephants', 'animal-elephant',
            'Giraffes', 'animal-giraffe',
            'Lions', 'animal-lion',
            'Leopards', 'animal-leopard',
            'Rhinos', 'animal-rhino',
            'animal-elephant',
          ],
          'icon-size': 0.8,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });

      map.current.addLayer({
        id: 'unclustered-report-points',
        type: 'symbol',
        source: 'reports',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'match',
            ['get', 'category'],
            ...Object.keys(REPORT_ICONS).flatMap((category) => [
              category,
              getReportMapIconId(category),
            ]),
            getReportMapIconId('Wildlife_Sighting'),
          ],
          'icon-size': 0.9,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });

      // Add click handlers for unclustered points
      if (!mapInteractionsRegistered.current) {
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
                  <span class="value">${properties.date} ${properties.time}</span>
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
        mapInteractionsRegistered.current = true;
      }
      setIsMapReady(true);
    });

    return () => {
      setIsMapReady(false);
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
    const fetchedData = {};

    const unsubscribes = animalSpecies.map(species => {
      const speciesRef = ref(database, `Animals/${species}`);
      return onValue(speciesRef, (snapshot) => {
        const data = snapshot.val();
        Object.keys(fetchedData)
          .filter((key) => key.startsWith(`${species}-`))
          .forEach((key) => delete fetchedData[key]);

        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([id, animal]) => {
            const history = extractLocationHistory(animal?.location);
            const latestPoint = history.slice().reverse()
              .find((point) => point.timestamp !== null) || history[history.length - 1];

            if (latestPoint) {
              fetchedData[`${species}-${id}`] = {
                id: `${species}-${id}`,
                species,
                name: animal.name || `${species.slice(0, -1)} ${id}`,
                age: animal.age,
                sex: animal.sex || 'Unknown',
                date: latestPoint.timestamp === null ? 'Unknown' : new Date(latestPoint.timestamp).toISOString().slice(0, 10),
                time: latestPoint.timestamp === null ? 'Unknown' : new Date(latestPoint.timestamp).toISOString().slice(11, 19),
                timestamp: latestPoint.timestamp,
                history,
                location: {
                  Lat: latestPoint.latitude,
                  Lng: latestPoint.longitude,
                  activity: latestPoint.activity,
                  temperature: latestPoint.temperature,
                  heart_rate: latestPoint.heartRate,
                  satellites: latestPoint.satellites,
                  altitude: latestPoint.altitude,
                  speed_knots: latestPoint.recordedSpeedKnots,
                }
              };
            }
          });
        }

        setAnimalData(Object.values(fetchedData));
      }, (error) => {
        console.error(`Error fetching data for ${species}:`, error);
        if (error.code === 'PERMISSION_DENIED') {
          console.error('Permission denied. Check your database rules.');
        } else if (error.code === 'UNAVAILABLE') {
          console.error('Database is unavailable. Check your internet connection and Firebase project status.');
        }
      });
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  useEffect(() => {
    onPatrolDataChange?.(patrolData);
  }, [patrolData, onPatrolDataChange]);

  useEffect(() => {
    if (!map.current || !selectedAnimalLocation) return;
    const latitude = Number(selectedAnimalLocation.Lat ?? selectedAnimalLocation.latitude);
    const longitude = Number(selectedAnimalLocation.Lng ?? selectedAnimalLocation.Long ?? selectedAnimalLocation.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const moveToLocation = () => {
      map.current?.easeTo({
        center: [longitude, latitude],
        zoom: Math.max(map.current.getZoom(), 13),
        duration: 700,
      });
    };

    if (map.current.loaded()) moveToLocation();
    else map.current.once('load', moveToLocation);
  }, [isMapReady, selectedAnimalLocation]);

  // Fetch patrol data
  useEffect(() => {
    const patrolRef = ref(database, 'PatrolOfficers');
    return onValue(patrolRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        const patrolArray = Object.entries(data)
          .map(([id, patrol]) => {
            const latestFix = getLatestPatrolLocation(patrol?.location);
            if (!latestFix) return null;
            return {
              id,
              name: patrol.name || 'Unknown Officer',
              status: getPatrolStatus(patrol),
              timestamp: latestFix.timestamp,
              date: latestFix.date,
              time: latestFix.time,
              location: latestFix.location,
            };
          })
          .filter(Boolean);
        setPatrolData(patrolArray);
      } else {
        setPatrolData([]);
      }
    }, (error) => {
      console.error('Error fetching patrol officer locations:', error);
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const nextStyle = mapStyle === 'heatmap' || mapStyle === '3d'
      ? 'mapbox/outdoors-v11'
      : mapStyle;
    if (!nextStyle || nextStyle === currentMapStyle.current) return;

    try {
    map.current.setStyle(`mapbox://styles/${nextStyle}`, { diff: false });
    currentMapStyle.current = nextStyle;
    setIsMapReady(false);
    } catch (error) {
    console.error(`Unable to apply map style "${nextStyle}":`, error);
    }
  }, [mapStyle]);

  useEffect(() => {
    if (!isMapReady || !map.current) return;

    if (mapStyle === '3d') {
      if (!map.current.getSource('mapbox-dem')) {
        map.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.35 });
      return;
    }

    map.current.setTerrain(null);
  }, [isMapReady, mapStyle]);

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
        if (data && typeof data === 'object') {
          Object.keys(fetchedReports)
            .filter((key) => key.startsWith(`${category}-`))
            .forEach((key) => delete fetchedReports[key]);
          Object.entries(data)
            .forEach(([id, report]) => {
              const latitude = Number(report?.location?.Lat);
              const longitude = Number(report?.location?.Lng ?? report?.location?.Long);
              if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
                  !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return;
              const reportDateTime = getReportDateTime(report);
              fetchedReports[`${category}-${id}`] = {
                id: `${category}-${id}`,
                title: report.title || 'Untitled Report',
                category,
                date: reportDateTime.date,
                time: reportDateTime.time,
                timestamp: getReportTimestamp(report),
                location: {
                  Lat: latitude,
                  Lng: longitude
                }
              };
            });
        }
        setReportData(Object.values(fetchedReports));
      });
    });

    // Cleanup function to unsubscribe all listeners
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Update animal source data
  useEffect(() => {
    if (!isMapReady || !map.current || !map.current.getSource('animals')) return;

    const visibleAnimals = isRealTimeMode
      ? animalData.filter((animal) => isWithinLastHour(animal.timestamp, currentTime))
      : animalData;
    const features = visibleAnimals.map(animal => ({
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
          temperature: animal.location.temperature,
          heart_rate: animal.location.heart_rate,
          satellites: animal.location.satellites,
          altitude: animal.location.altitude,
          speed_knots: animal.location.speed_knots
        }
    }));

    const visibleFeatures = showAnimals ? features : [];
    const featureCollection = { type: 'FeatureCollection', features: visibleFeatures };
    map.current.getSource('animals').setData(featureCollection);
    map.current.getSource('animals-heatmap').setData(featureCollection);

    const isHeatmap = mapStyle === 'heatmap';
    ['animal-clusters', 'animal-cluster-count', 'unclustered-animal-points'].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          'visibility',
          showAnimals && !isHeatmap ? 'visible' : 'none'
        );
      }
    });
    if (map.current.getLayer('animal-heatmap')) {
      map.current.setLayoutProperty(
        'animal-heatmap',
        'visibility',
        showAnimals && isHeatmap ? 'visible' : 'none'
      );
    }
  }, [animalData, currentTime, isMapReady, isRealTimeMode, mapStyle, showAnimals]);

  // Update report source data
  useEffect(() => {
    if (!isMapReady || !map.current || !map.current.getSource('reports')) return;

    const visibleReports = isRealTimeMode
      ? reportData.filter((report) => isWithinLastHour(report.timestamp, currentTime))
      : reportData;
    const features = visibleReports.map(report => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [report.location.Lng, report.location.Lat]
      },
      properties: {
        id: report.id,
        title: report.title,
        category: report.category,
        date: report.date,
        time: report.time
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
  }, [currentTime, isMapReady, isRealTimeMode, reportData, showReports]);

  // Handle patrol markers
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    // Remove existing patrol markers
    Object.values(markersRef.current.patrols).forEach(marker => marker.remove());
    markersRef.current.patrols = {};

    if (showPatrols) {
      const visiblePatrols = isRealTimeMode
        ? patrolData.filter((patrol) => isWithinLastHour(patrol.timestamp, currentTime))
        : patrolData;
      visiblePatrols.forEach(patrol => {
        if (patrol.location) {
          const el = document.createElement('div');
          el.className = 'marker patrol-marker';
          el.setAttribute('aria-label', `Patrol officer ${patrol.name}`);
          el.innerHTML = `
            <span class="patrol-marker__person">
              ${renderToStaticMarkup(React.createElement(UserRound, {
                size: 22,
                strokeWidth: 2,
                'aria-hidden': true,
              }))}
            </span>
            <span class="patrol-marker__badge">
              ${renderToStaticMarkup(React.createElement(ShieldCheck, {
                size: 12,
                strokeWidth: 2,
                'aria-hidden': true,
              }))}
            </span>
          `;
          
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
                      <span class="value">${patrol.date} ${patrol.time}</span>
                    </div>
                  </div>
                </div>
              `))
            .addTo(map.current);

          markersRef.current.patrols[patrol.id] = marker;
        }
      });
    }
  }, [currentTime, isMapReady, isRealTimeMode, patrolData, showPatrols]);

  // Function to trigger prediction mode
  // eslint-disable-next-line no-unused-vars
  const handlePredictMovement = () => {
    if (!animalData.length) return;
    // For demo, use the first animal with a path
    const animal = animalData[0];
    if (!animal || !animal.path || animal.path.length < 5) return;
    const path = animal.path;
    const splitIdx = Math.floor(path.length * 0.8);
    setHistoricalPath(path.slice(0, splitIdx));
    setPredictedPath(path.slice(splitIdx));
    setPredictionMode(true);
  };

  useEffect(() => {
    if (!map.current) return;
    // Remove old prediction layers if they exist
    if (map.current.getLayer('predicted-path')) {
      map.current.removeLayer('predicted-path');
    }
    if (map.current.getSource('predicted-path')) {
      map.current.removeSource('predicted-path');
    }
    if (predictionMode && predictedPath.length > 1) {
      map.current.addSource('predicted-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: predictedPath.map(p => [p.longitude || p.Lng, p.latitude || p.Lat])
          }
        }
      });
      map.current.addLayer({
        id: 'predicted-path',
        type: 'line',
        source: 'predicted-path',
        layout: {},
        paint: {
          'line-color': '#a020f0', // purple
          'line-width': 4,
          'line-dasharray': [2, 2]
        }
      });
    }
  }, [predictionMode, predictedPath]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Map;