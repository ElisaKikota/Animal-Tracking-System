import React from 'react';
import {
  Typography,
  Box,
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material';
import { BarChart } from 'lucide-react';

const PreviewAndUploadStep = ({ previewData, uploadStatus, uploadProgress, columnMappings }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Preview and Upload
      </Typography>
      
      <Typography variant="body1" paragraph>
        Review your processed data before uploading it to the database. 
        The following shows how your data will be stored.
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Timestamp</TableCell>
              {columnMappings.temperature && <TableCell>Temperature</TableCell>}
              {columnMappings.heartRate && <TableCell>Heart Rate</TableCell>}
              {columnMappings.animalId && <TableCell>Animal ID</TableCell>}
              {columnMappings.species && <TableCell>Species</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{rowIndex + 1}</TableCell>
                <TableCell>{row[columnMappings.latitude]}</TableCell>
                <TableCell>{row[columnMappings.longitude]}</TableCell>
                <TableCell>{row._processedTimestamp || 'Not available'}</TableCell>
                {columnMappings.temperature && <TableCell>{row[columnMappings.temperature]}</TableCell>}
                {columnMappings.heartRate && <TableCell>{row[columnMappings.heartRate]}</TableCell>}
                {columnMappings.animalId && <TableCell>{row[columnMappings.animalId]}</TableCell>}
                {columnMappings.species && <TableCell>{row[columnMappings.species]}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {uploadStatus === 'uploading' && (
        <Box sx={{ my: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading data to Firebase...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {uploadProgress}% Complete
          </Typography>
        </Box>
      )}
      
      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ my: 3 }}>
          <AlertTitle>Upload Successful!</AlertTitle>
          <Typography variant="body1" paragraph>
            Your data has been successfully uploaded to the database and is now available for analysis.
          </Typography>
          <Button variant="outlined" color="success" startIcon={<BarChart />}>
            Go to Analysis Dashboard
          </Button>
        </Alert>
      )}
      
      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ my: 3 }}>
          <AlertTitle>Upload Failed</AlertTitle>
          <Typography variant="body1">
            There was an error uploading your data. Please try again or contact support.
          </Typography>
        </Alert>
      )}
      
      {!uploadStatus && (
        <Alert severity="info" sx={{ my: 3 }}>
          <AlertTitle>Ready to Upload</AlertTitle>
          <Typography variant="body1" paragraph>
            Your data is ready to be uploaded to the Firebase database. Click the "Upload to Database" 
            button when you're ready to proceed.
          </Typography>
          <Typography variant="body2">
            <strong>Important:</strong> This process may take some time depending on the size of your dataset.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PreviewAndUploadStep;