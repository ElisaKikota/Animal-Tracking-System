import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { message } from 'antd';
import L from 'leaflet';
import * as tf from '@tensorflow/tfjs';
import { IsolationForest } from 'isolation-forest';

const AnalysisFeatures = ({ animalData, selectedAnimals, dateRange }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [modelType, setModelType] = useState('lstm');
  const [anomalyThreshold, setAnomalyThreshold] = useState(0.1);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [version, setVersion] = useState('');
  const markersRef = useRef([]);
  const mapRef = useRef(null);

  // Get map instance from window
  useEffect(() => {
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement && mapElement._leaflet_id) {
      mapRef.current = L.DomUtil.get(mapElement._leaflet_id);
    }
  }, []);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
    };
  }, []);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      // Simulate fetching models/versions from Firebase or local state
      setAvailableModels(['v1.0.0', 'v1.0.1']); // Example static versions
    };
    if (selectedAnimals.length > 0) {
      fetchModels();
    }
  }, [selectedAnimals]);

  const prepareTrainingData = (data) => {
    // Convert animal data into features and targets for training
    const features = data.map(point => [
      point.latitude,
      point.longitude,
      new Date(point.timestamp).getHours(),
      new Date(point.timestamp).getDay()
    ]);
    
    const targets = data.map((point, index) => {
      if (index === data.length - 1) return null;
      const nextPoint = data[index + 1];
      return Math.sqrt(
        Math.pow(nextPoint.latitude - point.latitude, 2) +
        Math.pow(nextPoint.longitude - point.longitude, 2)
      );
    }).filter(Boolean);

    return { features, targets };
  };

  const trainModel = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      // Simulate training delay
      setTimeout(() => {
        message.success('Model trained successfully! (Fake)');
        setIsVersionDialogOpen(false);
        setIsAnalyzing(false);
      }, 1500);
    } catch (error) {
      setError('Failed to train model');
      message.error('Failed to train model');
      setIsAnalyzing(false);
    }
  };

  const predictMovements = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      // Simulate prediction delay and fake predictions
      setTimeout(() => {
        const predictions = animalData.map(() => Math.random() * 10); // Fake predictions
        visualizePredictions(predictions);
        setIsAnalyzing(false);
      }, 1200);
    } catch (error) {
      setError('Failed to make predictions');
      setIsAnalyzing(false);
    }
  };

  const visualizePredictions = (predictions) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new prediction markers
    predictions.forEach((prediction, index) => {
      const point = animalData[index];
      const marker = L.marker([point.latitude, point.longitude])
        .bindPopup(`Predicted movement: ${prediction.toFixed(2)} units`)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Model Training
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                label="Model Type"
              >
                <MenuItem value="lstm">LSTM</MenuItem>
                <MenuItem value="random_forest">Random Forest</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => setIsVersionDialogOpen(true)}
              disabled={isAnalyzing || selectedAnimals.length === 0}
            >
              {isAnalyzing ? <CircularProgress size={24} /> : 'Train Model'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Movement Prediction
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Model Version</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                label="Select Model Version"
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={predictMovements}
              disabled={isAnalyzing || !selectedModel}
            >
              {isAnalyzing ? <CircularProgress size={24} /> : 'Predict Movements'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={isVersionDialogOpen} onClose={() => setIsVersionDialogOpen(false)}>
        <DialogTitle>Enter Model Version</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Version"
            type="text"
            fullWidth
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g., v1.0.0"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsVersionDialogOpen(false)}>Cancel</Button>
          <Button onClick={trainModel} disabled={!version || isAnalyzing}>
            {isAnalyzing ? <CircularProgress size={24} /> : 'Train'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalysisFeatures; 