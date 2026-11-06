import React, { useEffect, useState } from 'react';
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
  AlertTitle,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { generatePreviewData } from '../utils/dataProcessingUtils';

const TimestampConfigStep = ({ timestampConfig, setTimestampConfig, headerRow, columnMappings, previewData, renamedHeaders }) => {
  const [livePreview, setLivePreview] = useState([]);
  const [timeComponents, setTimeComponents] = useState({
    hourColumn: timestampConfig.hourColumn || '',
    minuteColumn: timestampConfig.minuteColumn || '',
    secondColumn: timestampConfig.secondColumn || ''
  });

  useEffect(() => {
    if (previewData && previewData.length > 0) {
      const configWithTimeComponents = {
        ...timestampConfig,
        hourColumn: timeComponents.hourColumn,
        minuteColumn: timeComponents.minuteColumn,
        secondColumn: timeComponents.secondColumn
      };
      const processed = generatePreviewData(previewData, configWithTimeComponents, columnMappings);
      setLivePreview(processed);
    }
  }, [timestampConfig, timeComponents, previewData, columnMappings]);

  // Sync timeComponents with timestampConfig when it changes from parent (auto-detection)
  useEffect(() => {
    if (timestampConfig.hourColumn || timestampConfig.minuteColumn || timestampConfig.secondColumn) {
      setTimeComponents({
        hourColumn: timestampConfig.hourColumn || '',
        minuteColumn: timestampConfig.minuteColumn || '',
        secondColumn: timestampConfig.secondColumn || ''
      });
    }
  }, [timestampConfig.hourColumn, timestampConfig.minuteColumn, timestampConfig.secondColumn]);

  const handleConfigChange = (field, value) => {
    setTimestampConfig({
      ...timestampConfig,
      [field]: value
    });
  };

  const handleTimeComponentChange = (field, value) => {
    const newTimeComponents = {
      ...timeComponents,
      [field]: value
    };
    setTimeComponents(newTimeComponents);

    // Also update the parent timestampConfig to ensure the changes persist
    setTimestampConfig({
      ...timestampConfig,
      hourColumn: newTimeComponents.hourColumn,
      minuteColumn: newTimeComponents.minuteColumn,
      secondColumn: newTimeComponents.secondColumn
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

          <FormControlLabel
            value="julian"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1">Use Julian day format</Typography>
                <Typography variant="body2" color="text.secondary">
                  Combine Year, Julian Day, Hour, and Minute columns
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
                          {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Select individual time component columns:
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Hour</InputLabel>
                        <Select
                          value={timeComponents.hourColumn}
                          onChange={(e) => handleTimeComponentChange('hourColumn', e.target.value)}
                          label="Hour"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {headerRow.map((header) => (
                            <MenuItem key={header} value={header}>
                              {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Minute</InputLabel>
                        <Select
                          value={timeComponents.minuteColumn}
                          onChange={(e) => handleTimeComponentChange('minuteColumn', e.target.value)}
                          label="Minute"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {headerRow.map((header) => (
                            <MenuItem key={header} value={header}>
                              {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Second</InputLabel>
                        <Select
                          value={timeComponents.secondColumn}
                          onChange={(e) => handleTimeComponentChange('secondColumn', e.target.value)}
                          label="Second"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {headerRow.map((header) => (
                            <MenuItem key={header} value={header}>
                              {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Or use a single time column:
                  </Typography>

                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Single Time Column (optional)</InputLabel>
                    <Select
                      value={timestampConfig.timeColumn}
                      onChange={(e) => handleConfigChange('timeColumn', e.target.value)}
                      label="Single Time Column (optional)"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {headerRow.map((header) => (
                        <MenuItem key={header} value={header}>
                          {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {!timestampConfig.timeColumn && !timeComponents.hourColumn && !timeComponents.minuteColumn && !timeComponents.secondColumn && (
                    <TextField
                      label="Default Time"
                      type="time"
                      value={timestampConfig.startTime}
                      onChange={(e) => handleConfigChange('startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                      fullWidth
                      margin="normal"
                      size="small"
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

      {timestampConfig.format === 'julian' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Julian Day Columns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the columns containing Year, Julian Day, Hour, and Minute values to construct timestamps.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Year Column</InputLabel>
                <Select
                  value={timestampConfig.yearColumn || ''}
                  onChange={(e) => handleConfigChange('yearColumn', e.target.value)}
                  label="Year Column"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {headerRow.map((header) => (
                    <MenuItem key={header} value={header}>
                      {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Julian Day Column</InputLabel>
                <Select
                  value={timestampConfig.julianDayColumn || ''}
                  onChange={(e) => handleConfigChange('julianDayColumn', e.target.value)}
                  label="Julian Day Column"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {headerRow.map((header) => (
                    <MenuItem key={header} value={header}>
                      {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Hour Column</InputLabel>
                <Select
                  value={timestampConfig.hourColumn || ''}
                  onChange={(e) => handleConfigChange('hourColumn', e.target.value)}
                  label="Hour Column"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {headerRow.map((header) => (
                    <MenuItem key={header} value={header}>
                      {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Minute Column</InputLabel>
                <Select
                  value={timestampConfig.minuteColumn || ''}
                  onChange={(e) => handleConfigChange('minuteColumn', e.target.value)}
                  label="Minute Column"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {headerRow.map((header) => (
                    <MenuItem key={header} value={header}>
                      {renamedHeaders && renamedHeaders[header] ? renamedHeaders[header] : header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Live Timestamp Preview
      </Typography>
      <Paper sx={{ maxWidth: 600, mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columnMappings.timestamp && <TableCell>Original Timestamp</TableCell>}
              {columnMappings.dateColumn && <TableCell>Original Date</TableCell>}
              {columnMappings.timeColumn && <TableCell>Original Time</TableCell>}
              {timestampConfig.format === 'custom' && timeComponents.hourColumn && <TableCell>Hour</TableCell>}
              {timestampConfig.format === 'custom' && timeComponents.minuteColumn && <TableCell>Minute</TableCell>}
              {timestampConfig.format === 'custom' && timeComponents.secondColumn && <TableCell>Second</TableCell>}
              {timestampConfig.format === 'julian' && timestampConfig.yearColumn && <TableCell>Year</TableCell>}
              {timestampConfig.format === 'julian' && timestampConfig.julianDayColumn && <TableCell>Julian Day</TableCell>}
              {timestampConfig.format === 'julian' && timestampConfig.hourColumn && <TableCell>Hour</TableCell>}
              {timestampConfig.format === 'julian' && timestampConfig.minuteColumn && <TableCell>Minute</TableCell>}
              <TableCell>Parsed Date</TableCell>
              <TableCell>Parsed Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {livePreview.length > 0 ? (
              livePreview.map((row, idx) => {
                let day = '';
                let time = '';
                if (row._processedTimestamp && row._processedTimestamp !== 'Invalid date') {
                  const [d, t] = row._processedTimestamp.split('T');
                  day = d;
                  time = t ? t.substring(0, 8) : '';
                }
                return (
                  <TableRow key={idx}>
                    {columnMappings.timestamp && <TableCell>{row[columnMappings.timestamp]}</TableCell>}
                    {columnMappings.dateColumn && <TableCell>{row[columnMappings.dateColumn]}</TableCell>}
                    {columnMappings.timeColumn && <TableCell>{row[columnMappings.timeColumn]}</TableCell>}
                    {timestampConfig.format === 'custom' && timeComponents.hourColumn && <TableCell>{row[timeComponents.hourColumn]}</TableCell>}
                    {timestampConfig.format === 'custom' && timeComponents.minuteColumn && <TableCell>{row[timeComponents.minuteColumn]}</TableCell>}
                    {timestampConfig.format === 'custom' && timeComponents.secondColumn && <TableCell>{row[timeComponents.secondColumn]}</TableCell>}
                    {timestampConfig.format === 'julian' && timestampConfig.yearColumn && <TableCell>{row[timestampConfig.yearColumn]}</TableCell>}
                    {timestampConfig.format === 'julian' && timestampConfig.julianDayColumn && <TableCell>{row[timestampConfig.julianDayColumn]}</TableCell>}
                    {timestampConfig.format === 'julian' && timestampConfig.hourColumn && <TableCell>{row[timestampConfig.hourColumn]}</TableCell>}
                    {timestampConfig.format === 'julian' && timestampConfig.minuteColumn && <TableCell>{row[timestampConfig.minuteColumn]}</TableCell>}
                    <TableCell>{day}</TableCell>
                    <TableCell>{time}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={
                  2 + // Parsed Date and Parsed Time
                  (columnMappings.timestamp ? 1 : 0) +
                  (columnMappings.dateColumn ? 1 : 0) +
                  (columnMappings.timeColumn ? 1 : 0) +
                  (timestampConfig.format === 'custom' && timeComponents.hourColumn ? 1 : 0) +
                  (timestampConfig.format === 'custom' && timeComponents.minuteColumn ? 1 : 0) +
                  (timestampConfig.format === 'custom' && timeComponents.secondColumn ? 1 : 0) +
                  (timestampConfig.format === 'julian' && timestampConfig.yearColumn ? 1 : 0) +
                  (timestampConfig.format === 'julian' && timestampConfig.julianDayColumn ? 1 : 0) +
                  (timestampConfig.format === 'julian' && timestampConfig.hourColumn ? 1 : 0) +
                  (timestampConfig.format === 'julian' && timestampConfig.minuteColumn ? 1 : 0)
                } align="center">
                  No data to preview. Please upload a file and map columns.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
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