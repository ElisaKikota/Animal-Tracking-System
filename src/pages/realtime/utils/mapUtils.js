
import { latLngBounds } from 'leaflet';

export const calculateMapBounds = (markers) => {
  if (!markers.length) return null;
  
  const bounds = latLngBounds([]);
  markers.forEach(marker => {
    bounds.extend([marker.location.Lat, marker.location.Lng]);
  });
  
  return bounds;
};

export const createClusterCustomIcon = (cluster) => {
  return {
    html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
    className: 'custom-marker-cluster',
  };
};

export const MAP_SETTINGS = {
  defaultCenter: [-1.948, 34.1665],
  defaultZoom: 16,
  maxZoom: 18,
  minZoom: 5
};
