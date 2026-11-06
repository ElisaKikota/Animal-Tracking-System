import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimalSpeciesIcon from './AnimalSpeciesIcon';

describe('AnimalSpeciesIcon', () => {
  test.each(['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'])(
    'renders the species icon for %s',
    (species) => {
      render(<AnimalSpeciesIcon species={species} />);

      expect(screen.getByRole('img', { name: species })).toBeInTheDocument();
    }
  );

  test('omits unknown species rather than showing a misleading animal', () => {
    render(<AnimalSpeciesIcon species="Unknown" />);

    expect(screen.queryByTestId('animal-species-icon')).not.toBeInTheDocument();
  });
});
