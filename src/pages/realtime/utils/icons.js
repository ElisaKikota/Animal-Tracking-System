import elephantIcon from '../../../assets/elephant.png';
import lionIcon from '../../../assets/lion.png';
import giraffeIcon from '../../../assets/giraffe.png';
import rhinoIcon from '../../../assets/rhino.png';
import leopardIcon from '../../../assets/leopard.png';
import CTIcon from '../../../assets/CT_Icon_Sighting.png';
import fireIcon from '../../../assets/Fire.png';
import humanWildlifeIcon from '../../../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../../../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../../../assets/Invasive_Species_Sighting.png';
import rainfallIcon from '../../../assets/Rainfall.png';
import rhinoSightingIcon from '../../../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../../../assets/Wildlife_Sighting.png';

export const getAnimalIcon = (species) => {
  const iconUrl = species.toLowerCase() === 'elephant' ? elephantIcon :
                  species.toLowerCase() === 'lion' ? lionIcon :
                  species.toLowerCase() === 'rhino' ? rhinoIcon :
                  species.toLowerCase() === 'leopard' ? leopardIcon :
                  giraffeIcon;

  return {
    url: iconUrl,
    size: [38, 38],
    anchor: [19, 38]
  };
};

export const createMarkerElement = (species) => {
  const el = document.createElement('div');
  el.className = 'marker';
  
  const iconUrl = getAnimalIcon(species).url;
  el.style.backgroundImage = `url(${iconUrl})`;
  el.style.width = '38px';
  el.style.height = '38px';
  el.style.backgroundSize = 'cover';

  return el;
};

export const getReportIcon = (category) => {
  const iconMap = {
    'CT_Icon_Sighting': CTIcon,
    'Fire': fireIcon,
    'Human_Wildlife_Contact': humanWildlifeIcon,
    'Injured_Animal': injuredAnimalIcon,
    'Invasive_Species_Sighting': invasiveSpeciesIcon,
    'Rainfall': rainfallIcon,
    'Rhino_Sighting': rhinoSightingIcon,
    'Wildlife_Sighting': wildlifeSightingIcon
  };

  return iconMap[category] || wildlifeSightingIcon;
};