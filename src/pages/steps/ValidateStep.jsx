import React from 'react';
import { 
  Typography, 
  Box, 
  Alert,
  AlertTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const ValidateStep = ({ headerRow, validationErrors, validationWarnings, previewData }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Data Validation
      </Typography>
      
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Errors Found</AlertTitle>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warnings</AlertTitle>
          <Typography variant="body2" paragraph>
            These warnings won't prevent you from proceeding, but you may want to check the data.
          </Typography>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
            {validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {validationErrors.length === 0 && validationWarnings.length === 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Validation Successful</AlertTitle>
          Your data looks good! You can proceed to the next step.
        </Alert>
      )}
      
      <Typography variant="subtitle1" gutterBottom>
        Available Columns:
      </Typography>
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {headerRow.map((header, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 1,
              bgcolor: '#f5f5f5',
              display: 'inline-block'
            }}
          >
            {header}
          </Box>
        ))}
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Data Preview:
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {headerRow.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{rowIndex + 1}</TableCell>
                {headerRow.map((header, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ValidateStep;