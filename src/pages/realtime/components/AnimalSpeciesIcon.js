import React from 'react';
import { getAnimalSpeciesIconDataUrl } from '../utils/animalSpeciesIcons';

const AnimalSpeciesIcon = ({ species, className = '' }) => {
  const iconUrl = getAnimalSpeciesIconDataUrl(species);
  if (!iconUrl) return null;

  return (
    <img
      src={iconUrl}
      alt={species}
      className={`animal-species-icon ${className}`.trim()}
      data-testid="animal-species-icon"
    />
  );
};

export default AnimalSpeciesIcon;
