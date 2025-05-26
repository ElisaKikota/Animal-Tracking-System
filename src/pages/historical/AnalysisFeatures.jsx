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
  Grid
} from '@mui/material';
import L from 'leaflet';
import * as tf from '@tensorflow/tfjs';
import { IsolationForest } from 'isolation-forest';

const AnalysisFeatures = ({ animalData, selectedAnimals, dateRange }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [modelType, setModelType] = useState('lstm'); // 'lstm' or 'rf'
  const [anomalyThreshold, setAnomalyThreshold] = useState(0.1);
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

  // Detect anomalies using Isolation Forest
  const detectAnomalies = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      markersRef.current = [];

      const allLocations = [];
      const locationMap = new Map(); // To keep track of which animal each location belongs to

      selectedAnimals.forEach(animalId => {
        const animal = animalData.find(a => a.id === animalId);
        if (!animal) return;

        const startTimestamp = dateRange.startDate.getTime();
        const endTimestamp = dateRange.endDate.getTime();

        const filteredLocations = animal.locationHistory.filter(
          loc => loc.timestamp >= startTimestamp && loc.timestamp <= endTimestamp
        );

        filteredLocations.forEach(loc => {
          allLocations.push([loc.lat, loc.lng, loc.timestamp]);
          locationMap.set(allLocations.length - 1, {
            animalId,
            animalName: animal.name,
            species: animal.species,
            ...loc
          });
        });
      });

      if (allLocations.length === 0) {
        throw new Error('No location data available for the selected time range');
      }

      // Initialize and train Isolation Forest
      const isolationForest = new IsolationForest({
        contamination: anomalyThreshold,
        randomState: 42
      });

      const scores = isolationForest.fitPredict(allLocations);
      
      // Find anomalies (scores < 0 are anomalies)
      const detectedAnomalies = scores
        .map((score, index) => ({ score, index }))
        .filter(({ score }) => score < 0)
        .map(({ index }) => locationMap.get(index));

      // Add markers to map
      detectedAnomalies.forEach(anomaly => {
        const circle = L.circle([anomaly.lat, anomaly.lng], {
          radius: 50,
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.3
        });

        const popup = L.popup().setContent(`
          <div>
            <strong>Anomaly Detected</strong><br />
            Animal: ${anomaly.animalName}<br />
            Species: ${anomaly.species}<br />
            Date: ${new Date(anomaly.timestamp).toLocaleDateString()}<br />
            Time: ${new Date(anomaly.timestamp).toLocaleTimeString()}
          </div>
        `);

        circle.bindPopup(popup);
        if (mapRef.current) {
          circle.addTo(mapRef.current);
        }
        markersRef.current.push(circle);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Predict future movements using LSTM
  const predictMovements = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      markersRef.current = [];

      for (const animalId of selectedAnimals) {
        const animal = animalData.find(a => a.id === animalId);
        if (!animal) continue;

        const startTimestamp = dateRange.startDate.getTime();
        const endTimestamp = dateRange.endDate.getTime();

        const filteredLocations = animal.locationHistory.filter(
          loc => loc.timestamp >= startTimestamp && loc.timestamp <= endTimestamp
        );

        if (filteredLocations.length < 10) {
          continue; // Need enough data points for prediction
        }

        // Prepare data for LSTM
        const sequenceLength = 5;
        const features = [];
        const targets = [];

        for (let i = 0; i < filteredLocations.length - sequenceLength; i++) {
          const sequence = filteredLocations.slice(i, i + sequenceLength);
          const target = filteredLocations[i + sequenceLength];
          
          features.push(sequence.map(loc => [loc.lat, loc.lng]));
          targets.push([target.lat, target.lng]);
        }

        // Convert to tensors
        const xs = tf.tensor3d(features);
        const ys = tf.tensor2d(targets);

        // Create and compile LSTM model
        const model = tf.sequential();
        model.add(tf.layers.lstm({
          units: 32,
          returnSequences: false,
          inputShape: [sequenceLength, 2]
        }));
        model.add(tf.layers.dense({ units: 2 }));

        model.compile({
          optimizer: tf.train.adam(0.01),
          loss: 'meanSquaredError'
        });

        // Train model
        await model.fit(xs, ys, {
          epochs: 50,
          batchSize: 32,
          shuffle: true,
          verbose: 0
        });

        // Make predictions
        const lastSequence = filteredLocations.slice(-sequenceLength);
        const lastSequenceTensor = tf.tensor3d([lastSequence.map(loc => [loc.lat, loc.lng])]);
        const prediction = model.predict(lastSequenceTensor);
        const predictedCoords = await prediction.array();

        const predictionData = {
          animalId,
          animalName: animal.name,
          species: animal.species,
          lastKnownPosition: lastSequence[lastSequence.length - 1],
          predictedPosition: {
            lat: predictedCoords[0][0],
            lng: predictedCoords[0][1],
            timestamp: endTimestamp + 24 * 60 * 60 * 1000 // Predict 24 hours ahead
          }
        };

        // Add markers to map
        const lastKnownCircle = L.circle([predictionData.lastKnownPosition.lat, predictionData.lastKnownPosition.lng], {
          radius: 50,
          color: 'green',
          fillColor: 'green',
          fillOpacity: 0.3
        });

        const predictedCircle = L.circle([predictionData.predictedPosition.lat, predictionData.predictedPosition.lng], {
          radius: 100,
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.2
        });

        const lastKnownPopup = L.popup().setContent(`
          <div>
            <strong>Last Known Location</strong><br />
            Animal: ${predictionData.animalName}<br />
            Species: ${predictionData.species}<br />
            Date: ${new Date(predictionData.lastKnownPosition.timestamp).toLocaleDateString()}<br />
            Time: ${new Date(predictionData.lastKnownPosition.timestamp).toLocaleTimeString()}
          </div>
        `);

        const predictedPopup = L.popup().setContent(`
          <div>
            <strong>Predicted Location</strong><br />
            Animal: ${predictionData.animalName}<br />
            Species: ${predictionData.species}<br />
            Predicted for: ${new Date(predictionData.predictedPosition.timestamp).toLocaleString()}
          </div>
        `);

        lastKnownCircle.bindPopup(lastKnownPopup);
        predictedCircle.bindPopup(predictedPopup);

        if (mapRef.current) {
          lastKnownCircle.addTo(mapRef.current);
          predictedCircle.addTo(mapRef.current);
        }

        markersRef.current.push(lastKnownCircle, predictedCircle);

        // Cleanup tensors
        xs.dispose();
        ys.dispose();
        lastSequenceTensor.dispose();
        prediction.dispose();
        model.dispose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Advanced Analysis
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Anomaly Detection
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Anomaly Threshold</InputLabel>
              <Select
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(e.target.value)}
                label="Anomaly Threshold"
              >
                <MenuItem value={0.05}>5%</MenuItem>
                <MenuItem value={0.1}>10%</MenuItem>
                <MenuItem value={0.15}>15%</MenuItem>
                <MenuItem value={0.2}>20%</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={detectAnomalies}
              disabled={isAnalyzing || selectedAnimals.length === 0}
            >
              {isAnalyzing ? <CircularProgress size={24} /> : 'Detect Anomalies'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Movement Prediction
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                label="Model Type"
              >
                <MenuItem value="lstm">LSTM</MenuItem>
                <MenuItem value="rf">Random Forest</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={predictMovements}
              disabled={isAnalyzing || selectedAnimals.length === 0}
            >
              {isAnalyzing ? <CircularProgress size={24} /> : 'Predict Movements'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AnalysisFeatures; 