import React from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const UploadCompleteStep = ({ originalRows, removedRows, remainingRows }) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/analysis'); // Change this path to your actual analysis dashboard route
  };

  const handleUploadAnother = () => {
    navigate(0); // This will refresh the page
    // Or use: navigate('/analysis-upload'); // If you have a dedicated upload route
  };

  return (
    <Box textAlign="center" py={6}>
      <CheckCircle size={80} color="#4caf50" style={{ marginBottom: 16 }} />
      <Typography variant="h5" gutterBottom>
        Upload Complete!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Your data has been successfully uploaded and processed. You can now use it for analysis and visualization.
      </Typography>
      {/* Statistics Section */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Paper elevation={2} sx={{ p: 2, minWidth: 320 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Upload Summary
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Original Rows</TableCell>
                <TableCell align="right">{originalRows}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rows Removed</TableCell>
                <TableCell align="right">{removedRows}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Rows Remaining</b></TableCell>
                <TableCell align="right"><b>{remainingRows}</b></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Box display="flex" justifyContent="center" gap={2}>
        <Button variant="contained" color="primary" onClick={handleGoToDashboard}>
          GO TO ANALYSIS DASHBOARD
        </Button>
        <Button variant="outlined" onClick={handleUploadAnother}>
          UPLOAD ANOTHER FILE
        </Button>
      </Box>
    </Box>
  );
};

UploadCompleteStep.propTypes = {
  originalRows: PropTypes.number.isRequired,
  removedRows: PropTypes.number.isRequired,
  remainingRows: PropTypes.number.isRequired,
};

export default UploadCompleteStep;