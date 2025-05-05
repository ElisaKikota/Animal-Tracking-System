import React from 'react';
import outdoorsIcon from '../../../assets/outdoors.png';
import lightIcon from '../../../assets/light.png';
import darkIcon from '../../../assets/dark.png';
import satelliteIcon from '../../../assets/satellite.png';
import threeDIcon from '../../../assets/3d.png';
import heatmapIcon from '../../../assets/heatmap.png';

const LayerMenu = ({ onLayerChange }) => {
  const layers = [
    { id: 'outdoors', style: 'mapbox/outdoors-v11', icon: outdoorsIcon, label: 'Outdoors' },
    { id: 'light', style: 'mapbox/light-v10', icon: lightIcon, label: 'Light' },
    { id: 'dark', style: 'mapbox/dark-v10', icon: darkIcon, label: 'Dark' },
    { id: 'satellite', style: 'mapbox/satellite-v9', icon: satelliteIcon, label: 'Satellite' },
    { id: '3d', style: 'elisakikota/clzjmuy7i00jx01r37jx58xy9', icon: threeDIcon, label: '3D' },
    { id: 'heatmap', style: 'mapbox/heatmap-v10', icon: heatmapIcon, label: 'Heatmap' }
  ];

  return (
    <div className="layer-menu show">
      {layers.map(layer => (
        <button 
          key={layer.id}
          className="btn" 
          onClick={() => onLayerChange(layer.style)}
        >
          <img src={layer.icon} alt={layer.label} className="layer-icon" />
          {layer.label}
        </button>
      ))}
    </div>
  );
};

export default LayerMenu;