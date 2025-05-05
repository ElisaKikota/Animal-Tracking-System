import React from 'react';
import outdoorsIcon from '../../assets/outdoors.png';
import lightIcon from '../../assets/light.png';
import darkIcon from '../../assets/dark.png';
import satelliteIcon from '../../assets/satellite.png';
import threeDIcon from '../../assets/3d.png';
import heatmapIcon from '../../assets/heatmap.png';
import '../../styles/RealTime.css';

const LayerMenu = ({ isVisible, handleLayerChange, isRealTime, setIsRealTime }) => {
  if (!isVisible) return null;

  return (
    <div id="layer-menu" className={`layer-menu ${isVisible ? 'show' : 'hide'}`}>
      <div className="layer-section tracking-toggle">
        <FormControlLabel
          control={
            <Switch
              checked={isRealTime}
              onChange={(e) => setIsRealTime(e.target.checked)}
              color="primary"
            />
          }
          label={isRealTime ? "Real-time Tracking" : "Last Known Location"}
          className="tracking-toggle-label"
        />
      </div>
      <div className="layer-section map-styles">
        <div className="section-title">Map Style</div>
        <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
          <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
          Outdoors
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
          <img src={lightIcon} alt="Light" className="layer-icon" />
          Light
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
          <img src={darkIcon} alt="Dark" className="layer-icon" />
          Dark
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
          <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
          Satellite
        </button>
        <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
          <img src={threeDIcon} alt="3D" className="layer-icon" />
          3D
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/heatmap-v10')}>
          <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
          Heatmap
        </button>
      </div>
    </div>
  );
};

export default LayerMenu;