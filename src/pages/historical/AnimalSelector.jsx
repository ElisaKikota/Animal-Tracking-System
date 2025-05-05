import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { PawPrint } from 'lucide-react';

const AnimalSelector = ({ animals, selectedAnimals, onAnimalSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === '' || animal.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const speciesList = [...new Set(animals.map(animal => animal.species))];

  const handleSpeciesChange = (event) => {
    setSelectedSpecies(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAnimalChange = (event) => {
    const value = event.target.value;
    onAnimalSelection(value);
  };

  const getAnimalName = (id) => {
    const animal = animals.find(a => a.id === id);
    return animal ? animal.name : id;
  };

  return (
    <Box className="animal-selector">
      <Typography variant="h6" className="section-title">
        <PawPrint size={20} />
        Select Animals to Track
      </Typography>
      
      <Box className="filter-controls">
        <FormControl className="species-filter" sx={{ minWidth: 120 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={selectedSpecies}
            onChange={handleSpeciesChange}
            label="Species"
          >
            <MenuItem value="">All Species</MenuItem>
            {speciesList.map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl className="search-filter" sx={{ flex: 1 }}>
          <InputLabel>Search Animals</InputLabel>
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearchChange}
            label="Search Animals"
          />
        </FormControl>
      </Box>
      
      <FormControl className="animal-multi-select" sx={{ width: '100%', mt: 2 }}>
        <InputLabel>Select Animals</InputLabel>
        <Select
          multiple
          value={selectedAnimals}
          onChange={handleAnimalChange}
          input={<OutlinedInput label="Select Animals" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={getAnimalName(value)} />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5,
                width: 250,
              },
            },
          }}
        >
          {filteredAnimals.map((animal) => (
            <MenuItem key={animal.id} value={animal.id}>
              <Checkbox checked={selectedAnimals.indexOf(animal.id) > -1} />
              <ListItemText 
                primary={animal.name} 
                secondary={`${animal.species}, ${animal.sex}, ${animal.age} years`} 
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default AnimalSelector;