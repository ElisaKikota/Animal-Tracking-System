// LocationToggle.js
import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import './LocationToggle.css';

const LocationToggle = ({ isRealTimeMode, onToggle }) => {
  return (
    <div className="location-toggle-container">
      <FormControlLabel
        control={
          <Switch
            checked={isRealTimeMode}
            onChange={onToggle}
            color="primary"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#1F76CE',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#1F76CE',
              },
            }}
          />
        }
        label={isRealTimeMode ? "Real-Time Tracking" : "Last Known Location"}
        labelPlacement="start"
        sx={{
          margin: 0,
          '& .MuiTypography-root': {
            fontWeight: 500,
            marginRight: 1
          }
        }}
      />
    </div>
  );
};

export default LocationToggle;

// LocationToggle.css
