import React, { useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button
} from '@mui/material';
import { 
  HelpCircle,
  MapPin,
  ThermometerIcon,
  Heart,
  BarChart
} from 'lucide-react';

const ColumnMappingStep = ({ headerRow, columnMappings, setColumnMappings, previewData, parsedData, renamedHeaders, setRenamedHeaders }) => {
  const [timestampMode, setTimestampMode] = React.useState(
    columnMappings.dateColumn || columnMappings.timeColumn ? 'separate' : 'single'
  );

  // Auto-set timestamp mode when columnMappings change (e.g., after autoDetectColumns)
  useEffect(() => {
    if (columnMappings.dateColumn && columnMappings.timeColumn) {
      setTimestampMode('separate');
    } else if (columnMappings.timestamp) {
      setTimestampMode('single');
    }
  }, [columnMappings.dateColumn, columnMappings.timeColumn, columnMappings.timestamp]);

  // Add local state for renamed headers if not provided by parent
  const [localRenamedHeaders, setLocalRenamedHeaders] = React.useState(() => {
    if (renamedHeaders) return renamedHeaders;
    const obj = {};
    headerRow.forEach(h => { obj[h] = h; });
    return obj;
  });

  // Sync with parent if provided
  React.useEffect(() => {
    if (setRenamedHeaders) setRenamedHeaders(localRenamedHeaders);
  }, [localRenamedHeaders, setRenamedHeaders]);

  // Handle header rename
  const handleHeaderRename = (original, newName) => {
    setLocalRenamedHeaders(prev => ({ ...prev, [original]: newName }));
  };
  const handleResetHeader = (original) => {
    setLocalRenamedHeaders(prev => ({ ...prev, [original]: original }));
  };

  // Use renamed headers in dropdowns
  const displayHeaders = headerRow.map(h => localRenamedHeaders[h] || h);

  const handleColumnChange = (field, value) => {
    setColumnMappings({
      ...columnMappings,
      [field]: value
    });
  };
  
  const handleTimestampModeChange = (event) => {
    const mode = event.target.value;
    setTimestampMode(mode);
    if (mode === 'single') {
      setColumnMappings({
        ...columnMappings,
        dateColumn: '',
        timeColumn: ''
      });
    } else {
      setColumnMappings({
        ...columnMappings,
        timestamp: ''
      });
    }
  };
  
  // Column type definitions with icons and descriptions
  const columnTypes = [
    {
      id: 'latitude',
      label: 'Latitude',
      icon: <MapPin size={20} />,
      description: 'Y-coordinate; values typically between -90° and 90°',
      required: true
    },
    {
      id: 'longitude',
      label: 'Longitude',
      icon: <MapPin size={20} />,
      description: 'X-coordinate; values typically between -180° and 180°',
      required: true
    },
    {
      id: 'temperature',
      label: 'Temperature',
      icon: <ThermometerIcon size={20} />,
      description: 'Temperature readings in celsius or fahrenheit',
      required: false
    },
    {
      id: 'heartRate',
      label: 'Heart Rate',
      icon: <Heart size={20} />,
      description: 'Heart rate/pulse in BPM',
      required: false
    },
    {
      id: 'animalId',
      label: 'Animal ID',
      icon: <BarChart size={20} />,
      description: 'Identifier for the animal being tracked',
      required: false
    },
    {
      id: 'species',
      label: 'Species',
      icon: <BarChart size={20} />,
      description: 'Animal species classification',
      required: false
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Map Columns
      </Typography>
      
      <Typography variant="body1" paragraph>
        Match your CSV columns to the required data fields. Required fields are marked with *. You can also rename headers below.
      </Typography>
      
      {/* Header renaming UI */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1">Rename Headers</Typography>
        <Grid container spacing={2}>
          {headerRow.map((header, idx) => (
            <Grid item xs={12} md={6} key={header}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Header ${idx + 1}`}
                  value={localRenamedHeaders[header] || header}
                  onChange={e => handleHeaderRename(header, e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                {localRenamedHeaders[header] !== header && (
                  <Button onClick={() => handleResetHeader(header)} size="small">Reset</Button>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {columnTypes.filter(ct => ct.id === 'latitude' || ct.id === 'longitude').map((columnType) => (
          <Grid item xs={12} md={6} key={columnType.id}>
            <Card
              variant="outlined"
              sx={{ 
                height: '100%',
                borderWidth: columnType.required ? 2 : 1,
                borderColor: columnType.required ? 'primary.main' : 'divider',
                position: 'relative'
              }}
            >
              {columnType.required && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderBottomLeftRadius: 8
                  }}
                >
                  Required
                </Box>
              )}
              <CardHeader
                avatar={<Box sx={{ color: 'primary.main' }}>{columnType.icon}</Box>}
                title={columnType.label}
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Tooltip title={columnType.description}>
                    <IconButton size="small">
                      <HelpCircle size={18} />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel id={`${columnType.id}-label`}>
                    Select Column
                  </InputLabel>
                  <Select
                    labelId={`${columnType.id}-label`}
                    value={columnMappings[columnType.id] || ''}
                    onChange={(e) => handleColumnChange(columnType.id, e.target.value)}
                    label="Select Column"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {displayHeaders.map((header, i) => (
                      <MenuItem key={headerRow[i]} value={headerRow[i]}>{header}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {columnMappings[columnType.id] && parsedData && parsedData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sample values:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      maxHeight: 60,
                      overflow: 'auto',
                      bgcolor: '#f5f5f5',
                      p: 1,
                      borderRadius: 1
                    }}>
                      {parsedData.slice(0, 3).map((row, i) => (
                        <Box key={i} sx={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          fontSize: '0.75rem'
                        }}>
                          {row[columnMappings[columnType.id]]}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Timestamp mode selection and mapping - now appears right after lat/lon */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Timestamp Columns
      </Typography>
      <RadioGroup
        row
        value={timestampMode}
        onChange={handleTimestampModeChange}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="single" control={<Radio />} label="Single timestamp column" />
        <FormControlLabel value="separate" control={<Radio />} label="Separate date and time columns" />
      </RadioGroup>

      {timestampMode === 'single' && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="timestamp-label">Timestamp Column</InputLabel>
          <Select
            labelId="timestamp-label"
            value={columnMappings.timestamp || ''}
            onChange={e => handleColumnChange('timestamp', e.target.value)}
            label="Timestamp Column"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {displayHeaders.map((header, i) => (
              <MenuItem key={headerRow[i]} value={headerRow[i]}>{header}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {timestampMode === 'separate' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="dateColumn-label">Date Column</InputLabel>
            <Select
              labelId="dateColumn-label"
              value={columnMappings.dateColumn || ''}
              onChange={e => handleColumnChange('dateColumn', e.target.value)}
              label="Date Column"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {displayHeaders.map((header, i) => (
                <MenuItem key={headerRow[i]} value={headerRow[i]}>{header}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="timeColumn-label">Time Column</InputLabel>
            <Select
              labelId="timeColumn-label"
              value={columnMappings.timeColumn || ''}
              onChange={e => handleColumnChange('timeColumn', e.target.value)}
              label="Time Column"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {displayHeaders.map((header, i) => (
                <MenuItem key={headerRow[i]} value={headerRow[i]}>{header}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* Now render the rest of the optional fields */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {columnTypes.filter(ct => ct.id !== 'latitude' && ct.id !== 'longitude').map((columnType) => (
          <Grid item xs={12} md={6} key={columnType.id}>
            <Card
              variant="outlined"
              sx={{ 
                height: '100%',
                borderWidth: columnType.required ? 2 : 1,
                borderColor: columnType.required ? 'primary.main' : 'divider',
                position: 'relative'
              }}
            >
              {columnType.required && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderBottomLeftRadius: 8
                  }}
                >
                  Required
                </Box>
              )}
              <CardHeader
                avatar={<Box sx={{ color: 'primary.main' }}>{columnType.icon}</Box>}
                title={columnType.label}
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Tooltip title={columnType.description}>
                    <IconButton size="small">
                      <HelpCircle size={18} />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel id={`${columnType.id}-label`}>
                    Select Column
                  </InputLabel>
                  <Select
                    labelId={`${columnType.id}-label`}
                    value={columnMappings[columnType.id] || ''}
                    onChange={(e) => handleColumnChange(columnType.id, e.target.value)}
                    label="Select Column"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {displayHeaders.map((header, i) => (
                      <MenuItem key={headerRow[i]} value={headerRow[i]}>{header}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {columnMappings[columnType.id] && parsedData && parsedData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sample values:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      maxHeight: 60,
                      overflow: 'auto',
                      bgcolor: '#f5f5f5',
                      p: 1,
                      borderRadius: 1
                    }}>
                      {parsedData.slice(0, 3).map((row, i) => (
                        <Box key={i} sx={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          fontSize: '0.75rem'
                        }}>
                          {row[columnMappings[columnType.id]]}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>Column Mapping Tips</AlertTitle>
        <ul>
          <li>Latitude and longitude are required for spatial analysis</li>
          <li>If your data doesn't have timestamps, you can generate them in the next step</li>
          <li>Mapping optional fields will enable more advanced analysis options</li>
        </ul>
      </Alert>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {Object.values(columnMappings).filter(Boolean).length} of {columnTypes.length} columns mapped
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {columnTypes.filter(ct => ct.required && columnMappings[ct.id]).length} of {columnTypes.filter(ct => ct.required).length} required columns mapped
          </Typography>
        </Box>
        
        {/* Show warning if required fields are missing */}
        {columnTypes.some(ct => ct.required && !columnMappings[ct.id]) && (
          <Alert severity="warning" sx={{ maxWidth: '60%' }}>
            Please map all required columns before proceeding
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default ColumnMappingStep;