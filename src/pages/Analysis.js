import React from 'react';
import { Box } from '@mui/material';
import AnalysisDataPage from './AnalysisDataPage';

function Analysis() {
  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)', // Subtract navbar height
        overflowY: 'auto',           // Make it scrollable
        px: 2,                       // Add horizontal padding
        py: 3                        // Add vertical padding
      }}
    >
      <AnalysisDataPage />
    </Box>
  );
}

export default Analysis;