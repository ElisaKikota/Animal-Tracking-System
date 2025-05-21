import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel } from '@mui/material';
import { getDatabase, ref, onValue } from 'firebase/database';

const animalCategories = [
  'Livestock',
  'Wildlife',
  'Pet',
  'Laboratory',
  'Aquatic',
  'Other'
];

const speciesOptions = [
  'Elephants',
  'Giraffes',
  'Leopards',
  'Lions',
  'Rhinos',
  'Wildebeest',
  'Other'
];

const sexes = ['male', 'female', 'unknown'];
const locations = ['Pen', 'Enclosure', 'Farm'];

const AnimalDetailsStep = ({ animalDetails, setAnimalDetails }) => {
  const [geoFences, setGeoFences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const geoFencesRef = ref(db, 'Geo-fences');
    
    const unsubscribe = onValue(geoFencesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fences = Object.entries(data).map(([id, fence]) => ({
          id,
          name: fence.name || id
        }));
        setGeoFences(fences);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching geo-fences:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnimalDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e) => {
    setAnimalDetails((prev) => ({ ...prev, showUploadInterval: e.target.checked }));
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Animal Details
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={animalDetails.category}
          onChange={handleChange}
          label="Category"
        >
          {animalCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Species</InputLabel>
        <Select
          name="species"
          value={animalDetails.species || ''}
          onChange={handleChange}
          label="Species"
        >
          {speciesOptions.map((sp) => (
            <MenuItem key={sp} value={sp}>{sp}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {animalDetails.species === 'Other' && (
        <TextField
          fullWidth
          margin="normal"
          label="Species Name"
          name="speciesName"
          value={animalDetails.speciesName || ''}
          onChange={handleChange}
        />
      )}
      <TextField
        fullWidth
        margin="normal"
        label="Animal Name"
        name="name"
        value={animalDetails.name}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Age"
        name="age"
        type="number"
        value={animalDetails.age}
        onChange={handleChange}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Sex</InputLabel>
        <Select
          name="sex"
          value={animalDetails.sex}
          onChange={handleChange}
          label="Sex"
        >
          {sexes.map((sex) => (
            <MenuItem key={sex} value={sex}>{sex.charAt(0).toUpperCase() + sex.slice(1) }</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Location</InputLabel>
        <Select
          name="location"
          value={animalDetails.location || ''}
          onChange={handleChange}
          label="Location"
        >
          {locations.map((loc) => (
            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
          ))}
          <MenuItem value="other">Other (type below)</MenuItem>
        </Select>
      </FormControl>
      {animalDetails.location === 'other' && (
        <TextField
          fullWidth
          margin="normal"
          label="Location Name"
          name="locationName"
          value={animalDetails.locationName || ''}
          onChange={handleChange}
        />
      )}
      <FormControl fullWidth margin="normal">
        <InputLabel>Geographical Area</InputLabel>
        <Select
          name="geoArea"
          value={animalDetails.geoArea || ''}
          onChange={handleChange}
          label="Geographical Area"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {loading ? (
            <MenuItem disabled>Loading geo-fences...</MenuItem>
          ) : (
            geoFences.map((fence) => (
              <MenuItem key={fence.id} value={fence.id}>
                {fence.name}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        margin="normal"
        label="Health Status (optional)"
        name="healthStatus"
        value={animalDetails.healthStatus || ''}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Weight (optional)"
        name="weight"
        type="number"
        value={animalDetails.weight || ''}
        onChange={handleChange}
      />
      <FormControlLabel
        control={
          <Switch
            checked={!!animalDetails.showUploadInterval}
            onChange={handleSwitch}
            color="primary"
          />
        }
        label="Set Upload Interval (optional)"
        sx={{ mt: 2 }}
      />
      {animalDetails.showUploadInterval && (
        <TextField
          fullWidth
          margin="normal"
          label="Upload Interval (minutes)"
          name="upload_interval"
          type="number"
          value={animalDetails.upload_interval || ''}
          onChange={handleChange}
        />
      )}
    </Box>
  );
};

export default AnimalDetailsStep; 