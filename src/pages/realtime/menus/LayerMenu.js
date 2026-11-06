import React, { useState } from 'react';
import { Box, Layers, Map, Moon, Satellite, Sun, Thermometer } from 'lucide-react';

const LayerMenu = ({ onLayerChange, selectedStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const layers = [
    { id: 'outdoors', style: 'mapbox/outdoors-v11', Icon: Map, label: 'Outdoors' },
    { id: 'light', style: 'mapbox/light-v10', Icon: Sun, label: 'Light' },
    { id: 'dark', style: 'mapbox/dark-v10', Icon: Moon, label: 'Dark' },
    { id: 'satellite', style: 'mapbox/satellite-v9', Icon: Satellite, label: 'Satellite' },
    { id: '3d', style: '3d', Icon: Box, label: '3D terrain' },
    { id: 'heatmap', style: 'heatmap', Icon: Thermometer, label: 'Animal heatmap' }
  ];

  return (
    <div className="map-layer-control">
      {isOpen && (
        <div className="map-layer-options" role="group" aria-label="Map style">
          {layers.map(layer => (
            <button
              key={layer.id}
              className={selectedStyle === layer.style ? 'active' : ''}
              onClick={() => {
                onLayerChange(layer.style);
                setIsOpen(false);
              }}
              aria-pressed={selectedStyle === layer.style}
            >
              <layer.Icon className="layer-icon" aria-hidden="true" strokeWidth={1.8} />
              {layer.label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="map-layer-toggle"
        aria-label="Choose map layers"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Layers className="layer-icon" aria-hidden="true" strokeWidth={1.8} />
        <span>Layers</span>
      </button>
    </div>
  );
};

export default LayerMenu;