import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Welcome from './pages/Welcome';

jest.mock('./firebase', () => ({ database: {} }));
jest.mock('firebase/database', () => ({
  ref: (_database, path) => ({ path }),
  onValue: (reference, onData) => {
    const data = {
      Animals: {
        Elephants: [
          null,
          {
            name: 'Elephant 1',
            location: {
              '2024-08-21': {
                '13:32': { Lat: -1.9, Long: 34.1 },
              },
            },
          },
          { name: 'Elephant 2' },
        ],
        Lions: {
          lion1: { name: 'Lion 1', location: { Lat: -2.1, Long: 34.3 } },
        },
      },
      PatrolOfficers: { officer1: { name: 'Officer 1' } },
      Reports: {
        Fire: {
          report1: { title: 'Field report', timestamp: 1735689600000 },
        },
      },
    };

    onData({ val: () => data[reference.path] || null });
    return jest.fn();
  },
}));

test('renders the primary navigation', () => {
  render(
    <MemoryRouter>
      <Sidebar isSidebarOpen={false} />
    </MemoryRouter>
  );
  expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /view animals/i })).toBeInTheDocument();
});

test('shows live animal, patrol, and report data on the dashboard', () => {
  render(
    <MemoryRouter>
      <Welcome />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /wildlife operations/i })).toBeInTheDocument();
  expect(screen.getByText('Live data connected')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /animals monitored 3/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /with location data 2/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /field reports 1/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /patrol officers 1/i })).toBeInTheDocument();
  expect(screen.getByText('Elephants')).toBeInTheDocument();
  expect(screen.getByText('Field report')).toBeInTheDocument();
});
