import React, { useEffect } from 'react';
import { FormGroup, FormControlLabel, Switch, Divider } from '@mui/material';
import { ref, set, onValue, get } from 'firebase/database';
import { database } from '../../firebase';
import './MapControls.css';

const MapControls = ({ 
  isRealTimeMode,
  showReports,
  showPatrols,
  showAnimals,
  onToggleRealTime,
  onToggleReports,
  onTogglePatrols,
  onToggleAnimals
}) => {
  // Update database when controls change
  const updateControlState = async (control, value) => {
    const controlsRef = ref(database, 'Controls');
    
    // First get current state
    const snapshot = await get(controlsRef);
    const currentControls = snapshot.exists() ? snapshot.val() : {
      trackingMode: 'lastKnown',
      showReports: true,
      showPatrols: true,
      showAnimals: true
    };

    // Update the specific control while preserving others
    switch(control) {
      case 'tracking':
        currentControls.trackingMode = value ? 'realtime' : 'lastKnown';
        break;
      case 'reports':
        currentControls.showReports = value;
        break;
      case 'patrols':
        currentControls.showPatrols = value;
        break;
      case 'animals':
        currentControls.showAnimals = value;
        break;
      default:
        return;
    }

    // Write back the entire controls object
    await set(controlsRef, currentControls);
  };

  // Listen to database changes
  useEffect(() => {
    const controlsRef = ref(database, 'Controls');
    
    // Initialize controls if they don't exist
    get(controlsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(controlsRef, {
          trackingMode: 'lastKnown',
          showReports: true,
          showPatrols: true,
          showAnimals: true
        });
      }
    });

    // Listen for changes
    const unsubscribe = onValue(controlsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.trackingMode) {
          onToggleRealTime(data.trackingMode === 'realtime');
        }
        if (typeof data.showReports !== 'undefined') {
          onToggleReports(data.showReports);
        }
        if (typeof data.showPatrols !== 'undefined') {
          onTogglePatrols(data.showPatrols);
        }
        if (typeof data.showAnimals !== 'undefined') {
          onToggleAnimals(data.showAnimals);
        }
      }
    });

    return () => unsubscribe();
  }, [onToggleRealTime, onToggleReports, onTogglePatrols, onToggleAnimals]);

  const handleTrackingChange = (event) => {
    onToggleRealTime(event.target.checked);
    updateControlState('tracking', event.target.checked);
  };

  const handleReportsChange = (event) => {
    onToggleReports(event.target.checked);
    updateControlState('reports', event.target.checked);
  };

  const handlePatrolsChange = (event) => {
    onTogglePatrols(event.target.checked);
    updateControlState('patrols', event.target.checked);
  };

  const handleAnimalsChange = (event) => {
    onToggleAnimals(event.target.checked);
    updateControlState('animals', event.target.checked);
  };

  return (
    <div className="map-controls-container">
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={isRealTimeMode}
              onChange={handleTrackingChange}
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
              color: 'white',
              fontWeight: 500,
              marginRight: 1
            }
          }}
        />
        <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        <FormControlLabel
          control={
            <Switch
              checked={showReports}
              onChange={handleReportsChange}
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
          label="Reports"
          labelPlacement="start"
          sx={{
            margin: 0,
            '& .MuiTypography-root': {
              color: 'white',
              fontWeight: 500,
              marginRight: 1
            }
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showPatrols}
              onChange={handlePatrolsChange}
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
          label="Patrol Officers"
          labelPlacement="start"
          sx={{
            margin: 0,
            '& .MuiTypography-root': {
              color: 'white',
              fontWeight: 500,
              marginRight: 1
            }
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showAnimals}
              onChange={handleAnimalsChange}
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
          label="Animals"
          labelPlacement="start"
          sx={{
            margin: 0,
            '& .MuiTypography-root': {
              color: 'white',
              fontWeight: 500,
              marginRight: 1
            }
          }}
        />
      </FormGroup>
    </div>
  );
};

export default MapControls; 