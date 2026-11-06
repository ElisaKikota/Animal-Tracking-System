import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel, Button, Alert, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormGroup } from '@mui/material';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
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
const locations = ['Pen', 'Enclosure', 'Farm', 'National Park', 'Game Reserve'];

const AnimalDetailsStep = ({ animalDetails, setAnimalDetails, currentAnimalId, setCurrentAnimalId, uniqueAnimalIds }) => {
  const [geoFences, setGeoFences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSelectiveCopyDialog, setShowSelectiveCopyDialog] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState([]);

  const currentDetails = animalDetails[currentAnimalId] || {
    category: '',
    name: '',
    age: '',
    sex: '',
    location: '',
    species: '',
    locationName: '',
    geoArea: '',
    healthStatus: '',
    weight: '',
    showUploadInterval: false,
    upload_interval: ''
  };

  const currentIndex = uniqueAnimalIds.indexOf(currentAnimalId);
  const hasMultipleAnimals = uniqueAnimalIds.length > 1;

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
    setAnimalDetails((prev) => ({
      ...prev,
      [currentAnimalId]: {
        ...prev[currentAnimalId],
        [name]: value
      }
    }));
  };

  const handleSwitch = (e) => {
    setAnimalDetails((prev) => ({
      ...prev,
      [currentAnimalId]: {
        ...prev[currentAnimalId],
        showUploadInterval: e.target.checked
      }
    }));
  };

  const handleNextAnimal = () => {
    if (currentIndex < uniqueAnimalIds.length - 1) {
      setCurrentAnimalId(uniqueAnimalIds[currentIndex + 1]);
    }
  };

  const handlePreviousAnimal = () => {
    if (currentIndex > 0) {
      setCurrentAnimalId(uniqueAnimalIds[currentIndex - 1]);
    }
  };

  const handleCopyToAll = () => {
    setShowCopyConfirmation(true);
  };

  const confirmCopyToAll = () => {
    setAnimalDetails((prev) => {
      const updated = { ...prev };
      uniqueAnimalIds.forEach(id => {
        updated[id] = { ...currentDetails };
      });
      return updated;
    });
    setShowCopyConfirmation(false);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const cancelCopyToAll = () => {
    setShowCopyConfirmation(false);
  };

  const handleSelectiveCopy = () => {
    setShowSelectiveCopyDialog(true);
    // Initialize with all animals except current one selected
    setSelectedAnimals(uniqueAnimalIds.filter(id => id !== currentAnimalId));
  };

  const handleAnimalSelection = (animalId) => {
    setSelectedAnimals(prev =>
      prev.includes(animalId)
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const confirmSelectiveCopy = () => {
    setAnimalDetails((prev) => {
      const updated = { ...prev };
      // Copy to selected animals plus current animal
      [currentAnimalId, ...selectedAnimals].forEach(id => {
        updated[id] = { ...currentDetails };
      });
      return updated;
    });
    setShowSelectiveCopyDialog(false);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const cancelSelectiveCopy = () => {
    setShowSelectiveCopyDialog(false);
    setSelectedAnimals([]);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Animal Details
      </Typography>

      {hasMultipleAnimals && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            {uniqueAnimalIds.length} different animal IDs detected. You can configure details for each separately or copy the same details to all.
          </Alert>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handlePreviousAnimal}
              disabled={currentIndex === 0}
              startIcon={<ChevronLeft />}
            >
              Previous
            </Button>

            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Animal ID: {currentAnimalId} ({currentIndex + 1} of {uniqueAnimalIds.length})
            </Typography>

            <Button
              variant="outlined"
              onClick={handleNextAnimal}
              disabled={currentIndex === uniqueAnimalIds.length - 1}
              endIcon={<ChevronRight />}
            >
              Next
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleCopyToAll}
              startIcon={<Copy />}
              sx={{ flex: 1 }}
            >
              Copy to All
            </Button>
            <Button
              variant="outlined"
              onClick={handleSelectiveCopy}
              startIcon={<Copy />}
              sx={{ flex: 1 }}
            >
              Copy to Selected
            </Button>
          </Box>

          {showCopyConfirmation && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                This will overwrite the details for all {uniqueAnimalIds.length} animals with the current animal's details. Are you sure?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={confirmCopyToAll}>
                  Yes, copy to all
                </Button>
                <Button size="small" variant="outlined" onClick={cancelCopyToAll}>
                  Cancel
                </Button>
              </Box>
            </Alert>
          )}

          {copySuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Details copied to all animals successfully!
            </Alert>
          )}

          <Divider sx={{ mb: 2 }} />
        </>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={currentDetails.category}
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
          value={currentDetails.species || ''}
          onChange={handleChange}
          label="Species"
        >
          {speciesOptions.map((sp) => (
            <MenuItem key={sp} value={sp}>{sp}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {currentDetails.species === 'Other' && (
        <TextField
          fullWidth
          margin="normal"
          label="Species Name"
          name="speciesName"
          value={currentDetails.speciesName || ''}
          onChange={handleChange}
        />
      )}
      <TextField
        fullWidth
        margin="normal"
        label="Animal Name"
        name="name"
        value={currentDetails.name}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Age"
        name="age"
        type="number"
        value={currentDetails.age}
        onChange={handleChange}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Sex</InputLabel>
        <Select
          name="sex"
          value={currentDetails.sex}
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
          value={currentDetails.location || ''}
          onChange={handleChange}
          label="Location"
        >
          {locations.map((loc) => (
            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
          ))}
          <MenuItem value="other">Other (type below)</MenuItem>
        </Select>
      </FormControl>
      {currentDetails.location === 'other' && (
        <TextField
          fullWidth
          margin="normal"
          label="Location Name"
          name="locationName"
          value={currentDetails.locationName || ''}
          onChange={handleChange}
        />
      )}
      <FormControl fullWidth margin="normal">
        <InputLabel>Geographical Area</InputLabel>
        <Select
          name="geoArea"
          value={currentDetails.geoArea || ''}
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
        value={currentDetails.healthStatus || ''}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Weight (optional)"
        name="weight"
        type="number"
        value={currentDetails.weight || ''}
        onChange={handleChange}
      />
      <FormControlLabel
        control={
          <Switch
            checked={!!currentDetails.showUploadInterval}
            onChange={handleSwitch}
            color="primary"
          />
        }
        label="Set Upload Interval (optional)"
        sx={{ mt: 2 }}
      />
      {currentDetails.showUploadInterval && (
        <TextField
          fullWidth
          margin="normal"
          label="Upload Interval (minutes)"
          name="upload_interval"
          type="number"
          value={currentDetails.upload_interval || ''}
          onChange={handleChange}
        />
      )}

      {/* Selective Copy Dialog */}
      <Dialog open={showSelectiveCopyDialog} onClose={cancelSelectiveCopy} maxWidth="sm" fullWidth>
        <DialogTitle>Select Animals to Copy Details To</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choose which animals should receive the current animal's details. The current animal ({currentAnimalId}) will always be included.
          </Typography>
          <FormGroup>
            {uniqueAnimalIds.filter(id => id !== currentAnimalId).map(id => (
              <FormControlLabel
                key={id}
                control={
                  <Checkbox
                    checked={selectedAnimals.includes(id)}
                    onChange={() => handleAnimalSelection(id)}
                  />
                }
                label={`Animal ID: ${id}`}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSelectiveCopy}>Cancel</Button>
          <Button onClick={confirmSelectiveCopy} variant="contained" disabled={selectedAnimals.length === 0}>
            Copy to {selectedAnimals.length + 1} animal(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnimalDetailsStep; 