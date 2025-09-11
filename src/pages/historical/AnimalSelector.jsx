import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput,
  Button,
  Paper,
  Fade,
  Chip
} from '@mui/material';
import { PawPrint } from 'lucide-react';

const AnimalSelector = ({ animals, selectedAnimals, onAnimalSelection, collapsed, onToggleCollapse }) => {
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

  const handleSelectAnimal = (id) => {
    onAnimalSelection([id]);
  };

  if (collapsed && selectedAnimals.length === 1) {
    const animal = animals.find(a => a.id === selectedAnimals[0]);
    return (
      <Box className="animal-selector" sx={{ mb: 2, p: 2, background: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="h6" className="section-title">
          <PawPrint size={20} /> Selected Animal
        </Typography>
        <Chip
          label={animal ? animal.name : selectedAnimals[0]}
          sx={{ mr: 1 }}
        />
        <Button size="small" onClick={onToggleCollapse}>Edit</Button>
      </Box>
    );
  }

  return (
    <Fade in timeout={400}>
      <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, background: '#fff', width: '100%', minWidth: 340, maxWidth: 420, boxSizing: 'border-box', overflowX: 'hidden' }}>
        <Typography variant="subtitle2" className="section-title" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, fontSize: 15 }}>
          <PawPrint size={18} /> Select Animal to Track
        </Typography>
        <Box className="filter-controls" sx={{ display: 'flex', gap: 1, mb: 1, width: '100%' }}>
          <FormControl className="species-filter" sx={{ minWidth: 80 }} size="small">
            <InputLabel>Species</InputLabel>
            <Select
              value={selectedSpecies}
              onChange={handleSpeciesChange}
              label="Species"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {speciesList.map(species => (
                <MenuItem key={species} value={species}>{species}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="search-filter" sx={{ flex: 1, minWidth: 0 }} size="small">
            <InputLabel>Search</InputLabel>
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearchChange}
              label="Search"
              size="small"
            />
          </FormControl>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 320, overflowY: 'auto' }}>
          {filteredAnimals.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: 13, textAlign: 'center' }}>No animals found.</Typography>
          )}
          {filteredAnimals.map(animal => {
            const isSelected = selectedAnimals.includes(animal.id);
            return (
              <Paper
                key={animal.id}
                elevation={isSelected ? 4 : 1}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  background: isSelected ? '#e3f2fd' : '#fff',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  transition: 'all 0.25s',
                  width: '100%',
                  boxSizing: 'border-box',
                  fontSize: 13,
                  minHeight: 56,
                  mb: 1.5
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1, pr: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                    {animal.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                    {animal.species}, {animal.sex}, {animal.age} years
                  </Typography>
                </Box>
                  <Button
                    variant={isSelected ? 'contained' : 'outlined'}
                    color="primary"
                    size="small"
                    onClick={() => handleSelectAnimal(animal.id)}
                    sx={{ minWidth: 80, fontSize: 12, transition: 'all 0.25s', backgroundColor: isSelected ? '#1976d2' : undefined, color: isSelected ? '#fff' : undefined }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
              </Paper>
            );
          })}
        </Box>
      </Paper>
    </Fade>
  );
};

export default AnimalSelector;