import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Binoculars,
  Bug,
  Camera,
  CloudRain,
  Flame,
  HeartPulse,
  PawPrint,
  UsersRound,
} from 'lucide-react';

export const REPORT_ICONS = {
  CT_Icon_Sighting: Camera,
  Fire: Flame,
  Human_Wildlife_Contact: UsersRound,
  Injured_Animal: HeartPulse,
  Invasive_Species_Sighting: Bug,
  Rainfall: CloudRain,
  Rhino_Sighting: PawPrint,
  Wildlife_Sighting: Binoculars,
};

export const getReportMapIconId = (category) =>
  `report-${category.toLowerCase().replace(/_/g, '-')}`;

export const getReportMapIconDataUrl = (category) => {
  const Icon = REPORT_ICONS[category] || Binoculars;
  const iconMarkup = renderToStaticMarkup(
    React.createElement(Icon, {
      width: 22,
      height: 22,
      stroke: '#194c34',
      strokeWidth: 2.2,
      'aria-hidden': true,
    })
  );
  const iconContents = iconMarkup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"
      fill="none" stroke="#194c34" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#194c34" stroke-width="1.5"/>
      <g transform="translate(5 5)">${iconContents}</g>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
