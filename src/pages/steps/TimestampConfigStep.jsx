import React from 'react';
import {
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle
} from '@mui/material';


const TimestampConfigStep = ({ timestampConfig, setTimestampConfig, headerRow, columnMappings }) => {
  const handleConfigChange = (field, value) => {
    setTimestampConfig({
      ...timestampConfig,
      [field]: value
    });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Timestamps
      </Typography>
      
      <Typography variant="body1" paragraph>
        Choose how to handle time data for your analysis. This is important for temporal analysis and visualization.
      </Typography>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Timestamp Approach
        </Typography>
        
        <RadioGroup
          value={timestampConfig.format}
          onChange={(e) => handleConfigChange('format', e.target.value)}
        >
          <FormControlLabel 
            value="auto" 
            control={<Radio />} 
            label={
              <Box>
                <Typography variant="body1">Use existing timestamp column</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use data from your timestamp column
                </Typography>
              </Box>
            } 
            disabled={!columnMappings.timestamp}
          />
          
          <FormControlLabel 
            value="custom" 
            control={<Radio />} 
            label={
              <Box>
                <Typography variant="body1">Configure from date/time columns</Typography>
                <Typography variant="body2" color="text.secondary">
                  Combine separate date and time columns
                </Typography>
              </Box>
            }
          />
          
          <FormControlLabel 
            value="interval" 
            control={<Radio />} 
            label={
              <Box>
                <Typography variant="body1">Generate timestamps at regular intervals</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use a start time and regular interval between readings
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Paper>
      
      {/* Conditional configuration blocks based on selected approach */}
      {timestampConfig.format === 'auto' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Using Timestamp Column: <strong>{columnMappings.timestamp || 'None selected'}</strong>
          </Typography>
          
          {!columnMappings.timestamp && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You need to select a timestamp column in the previous step, or choose a different approach.
            </Alert>
          )}
        </Paper>
      )}
      
      {timestampConfig.format === 'custom' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Date and Time Columns
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timestampConfig.hasDate} 
                    onChange={(e) => handleConfigChange('hasDate', e.target.checked)}
                  />
                }
                label="Include date"
              />
              
              {timestampConfig.hasDate && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Date Column</InputLabel>
                    <Select
                      value={timestampConfig.dateColumn}
                      onChange={(e) => handleConfigChange('dateColumn', e.target.value)}
                      label="Date Column"
                    >
                      <MenuItem value="">
                        <em>Use default date</em>
                      </MenuItem>
                      {headerRow.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {!timestampConfig.dateColumn && (
                    <TextField
                      label="Default Date"
                      type="date"
                      value={timestampConfig.startDate}
                      onChange={(e) => handleConfigChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                    />
                  )}
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timestampConfig.hasTime} 
                    onChange={(e) => handleConfigChange('hasTime', e.target.checked)}
                  />
                }
                label="Include time"
              />
              
              {timestampConfig.hasTime && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Time Column</InputLabel>
                    <Select
                      value={timestampConfig.timeColumn}
                      onChange={(e) => handleConfigChange('timeColumn', e.target.value)}
                      label="Time Column"
                    >
                      <MenuItem value="">
                        <em>Use default time</em>
                      </MenuItem>
                      {headerRow.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {!timestampConfig.timeColumn && (
                    <TextField
                      label="Default Time"
                      type="time"
                      value={timestampConfig.startTime}
                      onChange={(e) => handleConfigChange('startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                      fullWidth
                      margin="normal"
                    />
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {timestampConfig.format === 'interval' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Generate Timestamps at Regular Intervals
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={timestampConfig.startDate}
                onChange={(e) => handleConfigChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                type="time"
                value={timestampConfig.startTime}
                onChange={(e) => handleConfigChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Time between readings:
                </Typography>
                <TextField
                  type="number"
                  value={timestampConfig.interval}
                  onChange={(e) => handleConfigChange('interval', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  minutes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Alert severity="info">
        <AlertTitle>Timestamp Information</AlertTitle>
        <Typography variant="body2" paragraph>
          Properly configured timestamps allow for:
        </Typography>
        <ul>
          <li>Temporal analysis and trends over time</li>
          <li>Visualization of movement patterns</li>
          <li>Correlation with environmental factors</li>
          <li>Seasonal behavior analysis</li>
        </ul>
      </Alert>
    </Box>
  );
};

export default TimestampConfigStep;