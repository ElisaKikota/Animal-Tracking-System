import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const Welcome = () => {
  const [stats, setStats] = useState({
    animalsTracked: 0,
    speciesCovered: 0,
    patrolOfficers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataWithRetry = useCallback(async (ref, retryCount = 0) => {
    try {
      return await new Promise((resolve, reject) => {
        onValue(ref, resolve, (error) => {
          if (error.code === 'ERR_CONNECTION_RESET' && retryCount < MAX_RETRIES) {
            setTimeout(() => {
              fetchDataWithRetry(ref, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, RETRY_DELAY);
          } else {
            reject(error);
          }
        });
      });
    } catch (error) {
      if (error.code === 'ERR_CONNECTION_RESET' && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchDataWithRetry(ref, retryCount + 1);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const animalsRef = ref(database, 'Animals');
    const patrolOfficersRef = ref(database, 'PatrolOfficers');

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [animalsSnapshot, patrolOfficersSnapshot] = await Promise.all([
          fetchDataWithRetry(animalsRef),
          fetchDataWithRetry(patrolOfficersRef)
        ]);

        const animalsData = animalsSnapshot.val();
        const patrolOfficersData = patrolOfficersSnapshot.val();

        let totalAnimals = 0;
        const species = new Set();

        if (animalsData) {
          Object.keys(animalsData).forEach(speciesKey => {
            species.add(speciesKey);
            const speciesData = animalsData[speciesKey];
            totalAnimals += Object.keys(speciesData).length;
          });
        }

        const patrolOfficersCount = patrolOfficersData ? Object.keys(patrolOfficersData).length : 0;

        setStats({
          animalsTracked: totalAnimals,
          speciesCovered: species.size,
          patrolOfficers: patrolOfficersCount
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please check your internet connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchDataWithRetry]);

  return (
    <div className="h-full w-full" style={{ 
      background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 50%, #bbdefb 100%)',
      minHeight: '100vh',
      color: 'white',
      textAlign: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <Container 
        maxWidth='lg' 
        className="h-full"
        sx={{
          ml: '70px', // Compensate for sidebar width
          width: 'calc(100% - 70px)', // Adjust total width
          px: 3 // Add equal padding on both sides
        }}
      >
        <Box my={1}>
          <Typography variant="h2" component="h1" gutterBottom style={{ color: 'white' }}>
            Welcome to AI-Powered Animal Tracking System
          </Typography>
          <Typography variant="h5" component="p" gutterBottom style={{ color: 'white' }}>
            Efficient and reliable tracking of wildlife and domestic animals.
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/real_time" style={{ margin: '20px' }}>
            Start Tracking
          </Button>
        </Box>

        <Box my={4}>
          <Typography variant="h4" component="h2" gutterBottom style={{ color: 'white' }}>
            Statistics
          </Typography>
          {isLoading ? (
            <Typography>Loading data...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <Typography variant="h2" component="p" style={{ color: 'white' }}>
                    {stats.animalsTracked.toLocaleString()}
                  </Typography>
                  <Typography component="p" style={{ color: 'white' }}>
                    Animals Tracked
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <Typography variant="h2" component="p" style={{ color: 'white' }}>
                    {stats.speciesCovered.toLocaleString()}
                  </Typography>
                  <Typography component="p" style={{ color: 'white' }}>
                    Species Covered
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <Typography variant="h2" component="p" style={{ color: 'white' }}>
                    {stats.patrolOfficers.toLocaleString()}
                  </Typography>
                  <Typography component="p" style={{ color: 'white' }}>
                    Patrol Officers
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box my={4}>
          <Typography variant="h4" component="h2" gutterBottom style={{ color: 'white' }}>
            Success Stories
          </Typography>
          <Box display="flex" justifyContent="center">
            <Paper elevation={3} style={{ padding: '20px', width: '80%', backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <Typography component="p" style={{ color: 'white' }}>
                "Using the Animal Tracking system has revolutionized how we monitor wildlife. The real-time data and analytics have been invaluable."
              </Typography>
              <Typography variant="h6" component="p" style={{ color: 'white' }}>
                - Jane Doe, Wildlife Researcher
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Welcome;