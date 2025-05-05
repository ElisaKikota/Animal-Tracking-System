import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import { Search, Edit, Delete, Add, Map as MapIcon } from '@mui/icons-material';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '../firebase'; // Adjust the import path as needed
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PieChart from './PieChart'; // Adjust the import path as needed

// Import animal icons
import elephantIcon from '../assets/elephant.png';
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';

// Replace with your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2FraWtvdGEiLCJhIjoiY2x6MTkwYWRiMnE0ZTJpcjR5bzFjMzNrZyJ9.HRBoAER-bGLPEcdhbUsW_A';

function ViewAnimals() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animalStats, setAnimalStats] = useState({ total: 0, species: {} });
  const [showMap, setShowMap] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [-1.948, 34.1665],
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup on unmount
    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !filteredAnimals.length) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    filteredAnimals.forEach(animal => {
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Set icon based on species
      const iconUrl = animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                     animal.species.toLowerCase() === 'lion' ? lionIcon :
                     animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                     animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                     giraffeIcon;

      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.width = '38px';
      el.style.height = '38px';
      el.style.backgroundSize = 'cover';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([animal.location.Lng, animal.location.Lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 10px;">
                <strong>${animal.name}</strong><br>
                Species: ${animal.species}<br>
                Sex: ${animal.sex}<br>
                Age: ${animal.age} years<br>
                Temperature: ${animal.temperature}°C<br>
                Activity: ${animal.activity}
              </div>
            `)
        )
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [filteredAnimals]);

  useEffect(() => {
    const animalsRef = ref(database, 'Animals');
    onValue(animalsRef, (snapshot) => {
      const data = snapshot.val();
      const animalList = data ? Object.entries(data).flatMap(([species, animals]) => 
        Object.entries(animals).map(([id, animal]) => ({
          id,
          species,
          ...animal,
          location: animal.location ? Object.values(animal.location).pop() : null
        }))
      ) : [];
      setAnimals(animalList);
      setFilteredAnimals(animalList);
      updateAnimalStats(animalList);
    });
  }, []);

  useEffect(() => {
    const filtered = animals.filter(animal => 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (speciesFilter === '' || animal.species === speciesFilter)
    );
    setFilteredAnimals(filtered);
  }, [searchTerm, speciesFilter, animals]);

  const updateAnimalStats = (animalList) => {
    const stats = { total: animalList.length, species: {} };
    animalList.forEach(animal => {
      if (stats.species[animal.species]) {
        stats.species[animal.species]++;
      } else {
        stats.species[animal.species] = 1;
      }
    });
    setAnimalStats(stats);
  };

  const handleOpenDialog = (animal = null) => {
    setSelectedAnimal(animal);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnimal(null);
  };

  const handleSaveAnimal = (animalData) => {
    if (selectedAnimal) {
      update(ref(database, `Animals/${animalData.species}/${selectedAnimal.id}`), animalData);
    } else {
      // const newAnimalRef = ref(database, `Animals/${animalData.species}`);
      // const newAnimal = set(newAnimalRef, animalData);
    }
    handleCloseDialog();
  };

  const handleDeleteAnimal = (animalId, species) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      remove(ref(database, `Animals/${species}/${animalId}`));
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Animal Management
      </Typography>
      
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Chip label={`Total Animals: ${animalStats.total}`} color="primary" />
          {Object.entries(animalStats.species).map(([species, count]) => (
            <Chip key={species} label={`${species}: ${count}`} style={{ marginLeft: 8 }} />
          ))}
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Animal
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16, height: 300 }}>
            {animalStats.species && Object.keys(animalStats.species).length > 0 && (
              <PieChart data={animalStats.species} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Last Known Locations</Typography>
            <Button startIcon={<MapIcon />} onClick={() => setShowMap(!showMap)}>
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            {showMap && (
              <div ref={mapContainer} className="map" style={{ height: '500px', width: '100%' }} />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" mb={3}>
        <TextField
          label="Search Animals"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search />
          }}
          style={{ marginRight: 16, flexGrow: 1 }}
        />
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            label="Species"
          >
            <MenuItem value="">All</MenuItem>
            {Object.keys(animalStats.species).map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Sex</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAnimals.map((animal) => (
              <TableRow key={animal.id}>
                <TableCell>{animal.name}</TableCell>
                <TableCell>{animal.species}</TableCell>
                <TableCell>{animal.age}</TableCell>
                <TableCell>{animal.sex}</TableCell>
                <TableCell>
                  {animal.location ? new Date(animal.location.timestamp).toLocaleString() : 'Unknown'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(animal)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteAnimal(animal.id, animal.species)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AnimalDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveAnimal}
        animal={selectedAnimal}
      />
    </Container>
  );
}

function AnimalDialog({ open, onClose, onSave, animal }) {
  const [animalData, setAnimalData] = useState({
    name: '',
    species: '',
    age: '',
    sex: '',
    upload_interval: 60
  });

  useEffect(() => {
    if (animal) {
      setAnimalData(animal);
    } else {
      setAnimalData({
        name: '',
        species: '',
        age: '',
        sex: '',
        upload_interval: 60
      });
    }
  }, [animal]);

  const handleChange = (e) => {
    setAnimalData({ ...animalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(animalData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{animal ? 'Edit Animal' : 'Add New Animal'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          value={animalData.name}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Species</InputLabel>
          <Select
            name="species"
            value={animalData.species}
            onChange={handleChange}
          >
            <MenuItem value="Elephants">Elephants</MenuItem>
            <MenuItem value="Lions">Lions</MenuItem>
            <MenuItem value="Giraffes">Giraffes</MenuItem>
            <MenuItem value="Rhinos">Rhinos</MenuItem>
            <MenuItem value="Leopards">Leopards</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="age"
          label="Age"
          type="number"
          fullWidth
          value={animalData.age}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Sex</InputLabel>
          <Select
            name="sex"
            value={animalData.sex}
            onChange={handleChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="upload_interval"
          label="Upload Interval (minutes)"
          type="number"
          fullWidth
          value={animalData.upload_interval}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewAnimals;