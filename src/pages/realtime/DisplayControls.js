import React from 'react';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import './DisplayControls.css';

const DisplayControls = ({ 
  showReports, 
  showPatrols, 
  showAnimals, 
  onToggleReports, 
  onTogglePatrols, 
  onToggleAnimals 
}) => {
  return (
    <div className="display-controls-container">
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={showReports}
              onChange={onToggleReports}
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
              onChange={onTogglePatrols}
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
              onChange={onToggleAnimals}
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

export default DisplayControls; 