import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { database } from '../firebase';
import { ref as dbRef, onValue, set } from 'firebase/database';
import Papa from 'papaparse';

const FeatureEngineering = () => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [animalData, setAnimalData] = useState([]);
  const [enhancedData, setEnhancedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEnv, setFetchingEnv] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Recursively fetch all animals under AnalysisData
  useEffect(() => {
    const animalsRef = dbRef(database, 'AnalysisData');
    onValue(animalsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const animalList = [];
      // Recursively traverse species and animal IDs
      Object.entries(data).forEach(([species, animalsObj]) => {
        if (typeof animalsObj === 'object') {
          Object.entries(animalsObj).forEach(([id, animal]) => {
            if (animal && animal.csvDownloadURL) {
              animalList.push({
                key: `${species}/${id}`,
                species,
                id,
                name: animal.name || id,
                csvDownloadURL: animal.csvDownloadURL
              });
            }
          });
        }
      });
      setAnimals(animalList);
    });
  }, []);

  // Fetch and parse CSV when animal changes, with robust logging and user error message
  useEffect(() => {
    setErrorMsg('');
    if (!selectedAnimal) return;
    const animal = animals.find(a => a.key === selectedAnimal);
    if (!animal || !animal.csvDownloadURL) return;

    setLoading(true);
    console.log('Fetching CSV from:', animal.csvDownloadURL);
    fetch(animal.csvDownloadURL)
      .then(resp => {
        if (!resp.ok) {
          const msg = `Failed to fetch CSV: ${resp.status} ${resp.statusText}`;
          setErrorMsg(msg);
          console.error(msg);
          setLoading(false);
          return '';
        }
        return resp.text();
      })
      .then(csvText => {
        if (!csvText) {
          setErrorMsg('CSV text is empty or could not be loaded.');
          console.error('CSV text is empty');
          setLoading(false);
          return;
        }
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let rows = results.data;
            console.log('Parsed CSV rows:', rows);
            if (dateRange.start && dateRange.end) {
              rows = rows.filter(d => {
                const t = new Date(d.timestamp).getTime();
                return t >= new Date(dateRange.start).getTime() && t <= new Date(dateRange.end).getTime();
              });
            }
            setAnimalData(rows);
            setLoading(false);
            if (!rows.length) setErrorMsg('No data rows found in the CSV.');
          },
          error: (err) => {
            setErrorMsg('Failed to parse CSV file.');
            console.error('PapaParse error:', err);
            setLoading(false);
          }
        });
      })
      .catch((err) => {
        setErrorMsg('Fetch error: ' + err.message);
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [selectedAnimal, dateRange, animals]);

  // Fetch environment data for each point
  const enhanceWithEnvironment = async () => {
    setFetchingEnv(true);
    const results = [];
    for (const point of animalData) {
      const { latitude, longitude, timestamp } = point;
      if (!latitude || !longitude || !timestamp) {
        results.push({ ...point, temperature: null, precipitation: null });
        continue;
      }
      const date = new Date(timestamp).toISOString().split('T')[0];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${date}&end_date=${date}&hourly=temperature_2m,precipitation&timezone=auto`;
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        const hour = new Date(timestamp).getHours();
        const idx = data.hourly && data.hourly.time ? data.hourly.time.findIndex(t => new Date(t).getHours() === hour) : -1;
        const temp = idx !== -1 && data.hourly.temperature_2m ? data.hourly.temperature_2m[idx] : null;
        const precip = idx !== -1 && data.hourly.precipitation ? data.hourly.precipitation[idx] : null;
        results.push({ ...point, temperature: temp, precipitation: precip });
      } catch (e) {
        results.push({ ...point, temperature: null, precipitation: null });
      }
    }
    setEnhancedData(results);
    setFetchingEnv(false);
  };

  // Save enhanced data to Firebase
  const saveEnhancedData = async () => {
    if (!selectedAnimal) return;
    const enhancedRef = dbRef(database, `AnalysisData/${selectedAnimal.replace('/', '_')}_enhanced`);
    await set(enhancedRef, enhancedData);
    alert('Enhanced data saved to Firebase!');
  };

  // Fetch location names for each row using Nominatim
  const fetchLocationNames = async () => {
    setLocationLoading(true);
    const data = enhancedData.length ? enhancedData : animalData;
    const updated = await Promise.all(data.map(async (row) => {
      if (!row.latitude || !row.longitude) return { ...row, location_name: '-' };
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${row.latitude}&lon=${row.longitude}&zoom=10&addressdetails=1`;
        const resp = await fetch(url, { headers: { 'User-Agent': 'AnimalTrackingDemo/1.0' } });
        const json = await resp.json();
        return { ...row, location_name: json.display_name || '-' };
      } catch {
        return { ...row, location_name: '-' };
      }
    }));
    if (enhancedData.length) setEnhancedData(updated);
    else setAnimalData(updated);
    setLocationLoading(false);
  };

  // Dynamically determine columns from animalData or enhancedData
  const tableColumns = React.useMemo(() => {
    const data = enhancedData.length ? enhancedData : animalData;
    if (!data.length) return ['timestamp', 'latitude', 'longitude', 'temperature', 'precipitation', 'location_name'];
    const cols = Object.keys(data[0]);
    if (!cols.includes('location_name')) cols.push('location_name');
    return cols;
  }, [animalData, enhancedData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Feature Engineering: Add Environment Data</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 300 }} size="small">
            <InputLabel>Animal</InputLabel>
            <Select value={selectedAnimal} onChange={e => setSelectedAnimal(e.target.value)} label="Animal">
              {animals.map(a => (
                <MenuItem key={a.key} value={a.key}>{a.species} - {a.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateRange.start}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateRange.end}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
          />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button variant="contained" onClick={enhanceWithEnvironment} disabled={fetchingEnv || !animalData.length}>
            {fetchingEnv ? <CircularProgress size={20} /> : 'Enhance with Environment Data'}
          </Button>
          <Button variant="outlined" onClick={saveEnhancedData} disabled={!enhancedData.length}>Save Enhanced Data</Button>
          <Button variant="outlined" onClick={fetchLocationNames} disabled={locationLoading || !(enhancedData.length || animalData.length)}>
            {locationLoading ? <CircularProgress size={20} /> : 'Fetch Location Names'}
          </Button>
        </Box>
      </Paper>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Preview Enhanced Data</Typography>
      {errorMsg && <Typography color="error" sx={{ mb: 2 }}>{errorMsg}</Typography>}
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {tableColumns.map(col => (
                  <TableCell key={col}>{col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ')}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(enhancedData.length ? enhancedData : animalData).map((row, i) => (
                <TableRow key={i}>
                  {tableColumns.map(col => (
                    <TableCell key={col}>{row[col] !== undefined ? row[col] : '-'}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FeatureEngineering; 