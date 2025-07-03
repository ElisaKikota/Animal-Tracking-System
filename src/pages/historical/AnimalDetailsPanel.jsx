import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider, Fade, Paper, CircularProgress, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, Collapse, TextField, Slider, Checkbox, ListItemText, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Papa from 'papaparse';
import axios from 'axios';
import API_CONFIG from '../../config/api';
import { database } from '../../firebase';
import { ref as dbRef, set, update, push, onValue, get, child } from 'firebase/database';

const AnimalDetailsPanel = ({ animal, onBack, dataSource }) => {
  // All hooks must be before any return
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [csvColumns, setCsvColumns] = useState([]);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [columnMapping, setColumnMapping] = useState({ lat: '', lng: '', ts: '', date: '', time: '' });
  const [showTrainParams, setShowTrainParams] = useState(false);
  const [trainParams, setTrainParams] = useState({ 
    nEstimators: 100, 
    maxDepth: 10,
    trainTestSplit: 0.8  // Default to 80% training
  });
  const [modelType, setModelType] = useState('random_forest');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [featureColumns, setFeatureColumns] = useState([]);
  const [targetColumns, setTargetColumns] = useState([]);
  const [version, setVersion] = useState('v1.0.0');
  const [suggestedVersion, setSuggestedVersion] = useState('v1.0.0');
  const [datetimeMode, setDatetimeMode] = useState('timestamp'); // 'timestamp' or 'date_time'
  const [timestampColumn, setTimestampColumn] = useState('');
  const [dateColumn, setDateColumn] = useState('');
  const [timeColumn, setTimeColumn] = useState('');

  // Fetch models by type from Firebase
  useEffect(() => {
    if (!modelType) return;
    const typeLabel = modelType === 'random_forest' ? 'Random Forest' : 'LSTM';
    const modelsRef = dbRef(database, `Models/${typeLabel}`);
    const unsubscribe = onValue(modelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAvailableModels(Object.entries(data).map(([id, model]) => ({ id, ...model })));
      } else {
        setAvailableModels([]);
      }
    });
    return () => unsubscribe();
  }, [modelType]);

  // When a model is selected, load its parameters
  useEffect(() => {
    if (!selectedModel) return;
    const model = availableModels.find(m => m.id === selectedModel);
    if (model && model.parameters) {
      setTrainParams(params => ({
        ...params,
        nEstimators: model.parameters.nEstimators || 100,
        maxDepth: model.parameters.maxDepth || 10
      }));
    }
  }, [selectedModel, availableModels]);

  // When a model is selected, auto-increment version
  useEffect(() => {
    if (!selectedModel) return;
    const fetchVersions = async () => {
      try {
        // Fetch versions for the selected model (by model id)
        const res = await axios.get(`${API_CONFIG.BASE_URL}/models/${selectedModel}/versions`);
        const versions = res.data.versions || [];
        let nextVersion = 'v1.0.0';
        if (versions.length > 0) {
          // Find latest version and increment patch
          const latest = versions[versions.length - 1];
          const parts = latest.replace('v', '').split('.').map(Number);
          if (parts.length === 3) {
            parts[2] += 1;
            nextVersion = `v${parts[0]}.${parts[1]}.${parts[2]}`;
          }
        }
        setVersion(nextVersion);
        setSuggestedVersion(nextVersion);
      } catch (err) {
        setVersion('v1.0.0');
        setSuggestedVersion('v1.0.0');
      }
    };
    fetchVersions();
  }, [selectedModel, modelType, animal]);

  // Model expects these columns:
  const expectedColumns = [
    { key: 'lat', label: 'Latitude' },
    { key: 'lng', label: 'Longitude' },
    { key: 'ts', label: 'Timestamp (or map Date & Time below)' }
  ];

  // All hooks above, now do the early return
  if (!animal) return null;
  const lastLocation = animal.locationHistory && animal.locationHistory.length > 0
    ? animal.locationHistory[animal.locationHistory.length - 1]
    : null;

  // Helper: Preview CSV columns
  const previewCsvColumns = async () => {
    if (!animal.csvUrl) {
      setSnackbar({ open: true, message: 'No CSV URL found for this animal.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(animal.csvUrl);
      if (!response.ok) throw new Error('Failed to fetch CSV file');
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: true });
      const sample = parsed.data[0] || {};
      const columns = Object.keys(sample).filter(k => k && k.trim());
      setCsvColumns(columns);
      setShowColumnMapping(true);
      setShowTrainParams(false);
      // Try to auto-map
      setColumnMapping(mapping => ({
        ...mapping,
        lat: columns.find(k => k.toLowerCase().includes('lat')) || '',
        lng: columns.find(k => k.toLowerCase().includes('lon') || k.toLowerCase().includes('lng')) || '',
        ts: columns.find(k => k.toLowerCase().includes('timestamp')) || '',
        date: columns.find(k => k.toLowerCase() === 'date') || '',
        time: columns.find(k => k.toLowerCase() === 'time') || ''
      }));
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to preview CSV.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Helper: Parse CSV and prepare features/targets using mapping
  const parseCsvForTraining = async (csvUrl, mapping, featuresArr, targetsArr) => {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Failed to fetch CSV file');
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const features = [];
          const targets = [];
          results.data.forEach(row => {
            // Features: array of selected feature columns
            const featureVals = featuresArr.map(col => parseFloat(row[col]));
            // Targets: array of selected target columns (can be multi-output)
            const targetVals = targetsArr.map(col => parseFloat(row[col]));
            // Only push if all values are valid numbers
            if (featureVals.every(v => !isNaN(v)) && targetVals.every(v => !isNaN(v))) {
              features.push(featureVals);
              targets.push(targetVals.length === 1 ? targetVals[0] : targetVals);
            }
          });
          resolve({ features, targets });
        },
        error: (err) => reject(err)
      });
    });
  };

  // Helper: Write training details to Firebase
  const writeTrainingDetails = async ({ animalId, species, modelName, modelType, version, status, accuracy, trainSize, testSize }) => {
    // Animal node: AnalysisData/{species}/{animalId}/trainings/{pushId}
    const animalTrainingsRef = dbRef(database, `AnalysisData/${species}/${animalId}/trainings`);
    const newTrainingRef = push(animalTrainingsRef);
    await set(newTrainingRef, {
      model: modelName,
      modelType,
      version,
      status,
      accuracy: accuracy || null,
      trainedAt: Date.now(),
      train_size: trainSize,
      test_size: testSize
    });
    // Model node: Models/{modelType}/{modelName}/trainings/{pushId}
    const modelTrainingsRef = dbRef(database, `Models/${modelType === 'random_forest' ? 'Random Forest' : 'LSTM'}/${modelName}/trainings`);
    const newModelTrainingRef = push(modelTrainingsRef);
    await set(newModelTrainingRef, {
      animalId,
      species,
      version,
      status,
      accuracy: accuracy || null,
      trainedAt: Date.now(),
      train_size: trainSize,
      test_size: testSize
    });
  };

  // Handler: Expand to show training params
  const handleExpandTrainParams = () => {
    setShowTrainParams(true);
    setShowColumnMapping(false);
  };

  // Handler: Train Model (from expanded section)
  const handleTrainModel = async () => {
    if (!animal.csvUrl) {
      setSnackbar({ open: true, message: 'No CSV URL found for this animal.', severity: 'error' });
      return;
    }
    if (featureColumns.length === 0 || targetColumns.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one feature and one target column.', severity: 'error' });
      return;
    }
    // Check for duplicate training
    const typeLabel = modelType === 'random_forest' ? 'Random Forest' : 'LSTM';
    const trainingsRef = dbRef(database, `Models/${typeLabel}/${selectedModel}/trainings`);
    const snapshot = await get(trainingsRef);
    if (snapshot.exists()) {
      const trainings = Object.values(snapshot.val());
      if (trainings.some(t => t.animalId === animal.id && t.version === version)) {
        setSnackbar({ open: true, message: 'This animal has already trained this model/version.', severity: 'error' });
        return;
      }
    }
    setLoading(true);
    let paramsUpdated = false;
    try {
      // If editing an existing model, update its parameters in Firebase if changed
      if (selectedModel) {
        const model = availableModels.find(m => m.id === selectedModel);
        if (model && model.parameters) {
          const newParams = {
            nEstimators: trainParams.nEstimators,
            maxDepth: trainParams.maxDepth
          };
          if (
            model.parameters.nEstimators !== newParams.nEstimators ||
            model.parameters.maxDepth !== newParams.maxDepth
          ) {
            const modelRef = dbRef(database, `Models/${typeLabel}/${selectedModel}/parameters`);
            await set(modelRef, newParams);
            paramsUpdated = true;
          }
        }
      }
      // Model details
      const modelName = selectedModel || `${animal.name.replace(/\s+/g, '')}_RF`;
      // If using date+time, ensure 'datetime_numeric' is in featureColumns
      let featuresToSend = featureColumns;
      if (datetimeMode === 'date_time' && !featureColumns.includes('datetime_numeric')) {
        featuresToSend = [...featureColumns, 'datetime_numeric'];
      }
      // Prepare payload
      const payload = {
        csv_url: animal.csvUrl,
        feature_columns: featuresToSend,
        target_columns: targetColumns,
        animal_id: animal.id,
        version,
        model_type: modelType,
        n_estimators: trainParams.nEstimators,
        max_depth: trainParams.maxDepth,
        train_test_split: trainParams.trainTestSplit,
        use_datetime: datetimeMode,
        timestamp_column: datetimeMode === 'timestamp' ? timestampColumn : undefined,
        date_column: datetimeMode === 'date_time' ? dateColumn : undefined,
        time_column: datetimeMode === 'date_time' ? timeColumn : undefined
      };
      console.log('Training payload:', payload);
      // Send to backend
      const response = await axios.post(`${API_CONFIG.BASE_URL}/train`, payload);
      // Write training details to Firebase
      await writeTrainingDetails({
        animalId: animal.id,
        species: animal.species,
        modelName,
        modelType,
        version,
        status: 'trained',
        accuracy: response.data?.accuracy || null,
        trainSize: response.data?.train_size,
        testSize: response.data?.test_size
      });
      // Update model's node with new version and storage URL if provided
      if (response.data?.model_url) {
        const modelVersionRef = dbRef(database, `Models/${typeLabel}/${selectedModel}/versions/${version}`);
        await set(modelVersionRef, {
          url: response.data.model_url,
          accuracy: response.data?.accuracy || null,
          trainedAt: Date.now(),
          parameters: {
            nEstimators: trainParams.nEstimators,
            maxDepth: trainParams.maxDepth
          }
        });
      }
      setSnackbar({ 
        open: true, 
        message: `Model trained successfully!${paramsUpdated ? ' (Parameters updated)' : ''} (Train: ${response.data.train_size} samples, Test: ${response.data.test_size} samples)`, 
        severity: 'success' 
      });
      setShowTrainParams(false);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setSnackbar({ open: true, message: 'This version already exists. Please choose another.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: err.message || 'Training failed.', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={400}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: '#fff', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <Box sx={{ background: 'none' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Animal Details</Typography>
            <Button onClick={onBack} variant="outlined" size="small">Back</Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            {animal.name} <span style={{ color: '#888', fontWeight: 400 }}>({animal.species})</span>
          </Typography>
          <Typography variant="body2">Sex: {animal.sex || 'Unknown'}</Typography>
          <Typography variant="body2">Age: {animal.age || 'Unknown'}</Typography>
          {lastLocation && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Last Known Location:
              </Typography>
              <Typography variant="body2">
                Lat: {lastLocation.lat.toFixed(4)}, Lng: {lastLocation.lng.toFixed(4)}
              </Typography>
              <Typography variant="body2">
                Date: {new Date(lastLocation.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Temperature: {lastLocation.temperature}°C, Activity: {lastLocation.activity}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Main action button to open training panel */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ textTransform: 'none', mb: 2 }}
            onClick={() => setShowColumnMapping(v => !v)}
            disabled={loading}
          >
            {showColumnMapping ? 'Hide Training Panel' : 'Train Model'}
          </Button>
          {/* Training panel collapse */}
          <Collapse in={showColumnMapping && !showTrainParams}>
            {/* Model Type and Model selectors */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 140 }} size="small">
                <InputLabel>Model Type</InputLabel>
                <Select
                  value={modelType}
                  label="Model Type"
                  onChange={e => {
                    setModelType(e.target.value);
                    setSelectedModel('');
                  }}
                >
                  <MenuItem value="random_forest">Random Forest</MenuItem>
                  <MenuItem value="lstm">LSTM</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Model</InputLabel>
                <Select
                  value={selectedModel}
                  label="Model"
                  onChange={e => setSelectedModel(e.target.value)}
                >
                  {availableModels.map(model => (
                    <MenuItem key={model.id} value={model.id}>{model.name || model.id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* Expected Model Version After Training */}
            <Box sx={{ mb: 2, p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'none' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Expected Model Version After Training</Typography>
              <TextField
                label="Version"
                size="small"
                value={version}
                onChange={e => setVersion(e.target.value)}
                sx={{ minWidth: 100 }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Suggested: {suggestedVersion}
              </Typography>
            </Box>
            <Box sx={{ mb: 2, p: 2, background: '#e3eafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Detected CSV Columns:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {csvColumns.map(col => (
                  <Box key={col} sx={{ px: 1.5, py: 0.5, background: '#fff', borderRadius: 1, fontSize: 13, border: '1px solid #b3cfff' }}>{col}</Box>
                ))}
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Feature Columns (Variables):</Typography>
              <FormControl sx={{ minWidth: 220, mb: 2 }} size="small">
                <InputLabel>Features</InputLabel>
                <Select
                  multiple
                  value={featureColumns}
                  onChange={e => setFeatureColumns(e.target.value)}
                  renderValue={selected => selected.join(', ')}
                  label="Features"
                >
                  {csvColumns.map(col => (
                    <MenuItem key={col} value={col}>
                      <Checkbox checked={featureColumns.indexOf(col) > -1} />
                      <ListItemText primary={col} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Target Column(s):</Typography>
              <FormControl sx={{ minWidth: 220, mb: 2 }} size="small">
                <InputLabel>Targets</InputLabel>
                <Select
                  multiple
                  value={targetColumns}
                  onChange={e => setTargetColumns(e.target.value)}
                  renderValue={selected => selected.join(', ')}
                  label="Targets"
                >
                  {csvColumns.map(col => (
                    <MenuItem key={col} value={col}>
                      <Checkbox checked={targetColumns.indexOf(col) > -1} />
                      <ListItemText primary={col} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Datetime Handling:</Typography>
              <ToggleButtonGroup
                value={datetimeMode}
                exclusive
                onChange={(_, val) => val && setDatetimeMode(val)}
                sx={{ mb: 2 }}
                size="small"
              >
                <ToggleButton value="timestamp">Use Timestamp column</ToggleButton>
                <ToggleButton value="date_time">Use Date + Time columns</ToggleButton>
              </ToggleButtonGroup>
              {datetimeMode === 'timestamp' && (
                <FormControl sx={{ minWidth: 220, mb: 2 }} size="small">
                  <InputLabel>Timestamp Column</InputLabel>
                  <Select
                    value={timestampColumn}
                    onChange={e => setTimestampColumn(e.target.value)}
                    label="Timestamp Column"
                  >
                    {csvColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {datetimeMode === 'date_time' && (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Date</InputLabel>
                    <Select
                      value={dateColumn}
                      onChange={e => setDateColumn(e.target.value)}
                      label="Date"
                    >
                      {csvColumns.map(col => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Time</InputLabel>
                    <Select
                      value={timeColumn}
                      onChange={e => setTimeColumn(e.target.value)}
                      label="Time"
                    >
                      {csvColumns.map(col => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ textTransform: 'none', mt: 2 }}
                onClick={handleExpandTrainParams}
                disabled={loading || featureColumns.length === 0 || targetColumns.length === 0}
              >
                Next: Set Training Parameters
              </Button>
            </Box>
          </Collapse>
          <Collapse in={showTrainParams}>
            <Box sx={{ mb: 2, p: 2, background: '#e3eafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Training Parameters (Random Forest)</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Train/Test Split: {Math.round(trainParams.trainTestSplit * 100)}% / {Math.round((1 - trainParams.trainTestSplit) * 100)}%
                </Typography>
                <Slider
                  value={trainParams.trainTestSplit}
                  onChange={(_, value) => setTrainParams(params => ({ ...params, trainTestSplit: value }))}
                  min={0.5}
                  max={0.9}
                  step={0.05}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  sx={{ width: '100%' }}
                />
              </Box>
              <TextField
                label="Number of Trees (n_estimators)"
                type="number"
                size="small"
                value={trainParams.nEstimators}
                onChange={e => setTrainParams(params => ({ ...params, nEstimators: parseInt(e.target.value) }))}
                sx={{ mb: 2, mr: 2 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Max Depth"
                type="number"
                size="small"
                value={trainParams.maxDepth}
                onChange={e => setTrainParams(params => ({ ...params, maxDepth: parseInt(e.target.value) }))}
                sx={{ mb: 2 }}
                inputProps={{ min: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ textTransform: 'none', mt: 2 }}
                onClick={handleTrainModel}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : null}
              >
                Start Training
              </Button>
            </Box>
          </Collapse>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button variant="contained" color="secondary" fullWidth sx={{ textTransform: 'none' }}>
              Predict Movement
            </Button>
            <Button variant="outlined" color="info" fullWidth sx={{ textTransform: 'none' }}>
              View Activity Chart
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="textSecondary">
            Data Source: {dataSource === 'predictive' ? 'Predictive Data' : 'Realtime Data'}
          </Typography>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Paper>
    </Fade>
  );
};

export default AnimalDetailsPanel; 