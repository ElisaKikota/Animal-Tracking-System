import elephant from '@iconify-icons/twemoji/elephant';
import giraffe from '@iconify-icons/twemoji/giraffe';
import leopard from '@iconify-icons/twemoji/leopard';
import lion from '@iconify-icons/twemoji/lion';
import rhinoceros from '@iconify-icons/twemoji/rhinoceros';

const SPECIES_ICONS = {
  elephant,
  giraffe,
  lion,
  leopard,
  rhino: rhinoceros,
  rhinoceros,
};

export const getAnimalSpeciesIcon = (species) => {
  const normalizedSpecies = String(species || '')
    .toLowerCase()
    .replace(/s$/, '')
    .trim();
  return SPECIES_ICONS[normalizedSpecies] || null;
};

export const getAnimalSpeciesIconDataUrl = (species) => {
  const icon = getAnimalSpeciesIcon(species);
  if (!icon) return null;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${icon.width}" height="${icon.height}" viewBox="0 0 ${icon.width} ${icon.height}">${icon.body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
