import React from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Button
} from '@mui/material';
import { CheckCircle } from 'lucide-react';

const UploadCompleteStep = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle size={80} color="#4caf50" />
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
        Upload Complete!
      </Typography>
      <Typography variant="body1" paragraph>
        Your data has been successfully uploaded and processed.
        You can now use it for analysis and visualization.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained"
          color="primary"
          component={Link}
          to="/analysis_dashboard"
          sx={{ mr: 2 }}
        >
          Go to Analysis Dashboard
        </Button>
        <Button variant="outlined">
          Upload Another File
        </Button>
      </Box>
    </Box>
  );
};

export default UploadCompleteStep;