import React from 'react';
import { 
  Typography, 
  Box, 
  Button,
  CircularProgress
} from '@mui/material';
import { Upload } from 'lucide-react';

const UploadStep = ({ selectedFile, handleFileUpload, isValidating }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload CSV File
      </Typography>
      
      <Typography variant="body1" paragraph>
        Upload a CSV file containing geodata (latitude/longitude) and optionally temperature, 
        heart rate, and timestamp information.
      </Typography>
      
      <Box sx={{ 
        border: '2px dashed #ccc', 
        borderRadius: 2, 
        p: 4, 
        textAlign: 'center',
        mb: 3,
        backgroundColor: '#f9f9f9',
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: '#1976d2',
          backgroundColor: '#f0f7ff'
        }
      }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<Upload />}
            sx={{ mb: 2 }}
            size="large"
          >
            Choose CSV File
          </Button>
        </label>
        
        <Typography variant="body2" color="textSecondary">
          {selectedFile ? `Selected: ${selectedFile.name}` : 'Supported format: CSV'}
        </Typography>
      </Box>
      
      {isValidating && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography color="primary" display="inline">
            Reading and parsing file...
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Requirements:
        </Typography>
        <ul>
          <li>File must be in CSV format</li>
          <li>Must contain latitude and longitude columns</li>
          <li>Timestamps can be provided or generated during import</li>
          <li>Optional columns: temperature, heart rate, animal ID, species</li>
        </ul>
      </Box>
    </Box>
  );
};

export default UploadStep;