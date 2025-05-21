import React, { useState, useEffect } from 'react';
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
  TableRow,
  FormControlLabel,
  Checkbox,
  Button,
  LinearProgress
} from '@mui/material';

const ValidateStep = ({ 
  headerRow, 
  validationErrors, 
  validationWarnings, 
  previewData, 
  setParsedData, 
  parsedData, 
  skipErrors, 
  setSkipErrors, 
  setAllRowsInvalid, 
  columnMappings, 
  removedRowsCount, 
  originalRowsCount 
}) => {
  const [filteredPreview, setFilteredPreview] = useState(previewData);
  const [skippedCount, setSkippedCount] = useState(0);
  const [hasSkippableRows, setHasSkippableRows] = useState(false);

  useEffect(() => {
    if (!parsedData || parsedData.length === 0) {
      setFilteredPreview([]);
      setSkippedCount(0);
      setHasSkippableRows(false);
      return;
    }

    if (!validationErrors.length) {
      // No validation errors, show first 5 rows of parsedData
      setFilteredPreview(parsedData.slice(0, 5));
      setSkippedCount(0);
      setHasSkippableRows(false);
      return;
    }

    // Only consider row-based errors (those with a row number)
    const rowErrorRegex = /Row\s*\d+/i;
    const rowErrors = validationErrors.filter(err => rowErrorRegex.test(err));
    const errorRows = rowErrors
      .map(err => {
        const match = err.match(/Row\s*(\d+)/i);
        return match ? parseInt(match[1], 10) - 1 : null;
      })
      .filter(idx => idx !== null);
    const uniqueErrorRows = Array.from(new Set(errorRows));
    const totalRows = parsedData.length;
    const allInvalid = totalRows > 0 && uniqueErrorRows.length === totalRows && rowErrors.length > 0;

    if (setAllRowsInvalid) {
      setAllRowsInvalid(allInvalid);
    }

    setHasSkippableRows(rowErrors.length > 0 && !allInvalid && uniqueErrorRows.length < totalRows);

    if (skipErrors && !allInvalid && rowErrors.length > 0) {
      const filtered = parsedData.filter((row, idx) => !uniqueErrorRows.includes(idx));
      setFilteredPreview(filtered.slice(0, 5));
      setSkippedCount(uniqueErrorRows.length);
    } else {
      setFilteredPreview(parsedData.slice(0, 5));
      setSkippedCount(0);
    }
  }, [validationErrors, skipErrors, parsedData, previewData, setAllRowsInvalid]);

  const handleSkipErrorsChange = (event) => {
    setSkipErrors(event.target.checked);
    if (event.target.checked && validationErrors.length > 0) {
      // Extract row numbers from error messages
      const errorRows = validationErrors
        .map(err => {
          const match = err.match(/Row\s*(\d+)/i);
          return match ? parseInt(match[1], 10) - 1 : null;
        })
        .filter(idx => idx !== null);
      const uniqueErrorRows = Array.from(new Set(errorRows));
      const filtered = parsedData.filter((row, idx) => !uniqueErrorRows.includes(idx));
      setParsedData(filtered);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Data Validation
      </Typography>
      {/* Show summary statistics and validation errors side by side */}
      {(originalRowsCount > 0) && (
        <Box display="flex" gap={2} mb={2} alignItems="stretch">
          <Paper elevation={2} sx={{ p: 2, minWidth: 320, flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: '100%', height: 'auto' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Data Summary
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Original Rows</TableCell>
                  <TableCell>Rows Removed</TableCell>
                  <TableCell><b>Rows Remaining</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{originalRowsCount}</TableCell>
                  <TableCell>{removedRowsCount}</TableCell>
                  <TableCell><b>{parsedData.length}</b></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ flex: '1 1 0', mb: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', minHeight: '100%', height: 'auto' }}>
              <AlertTitle>Validation Errors ({validationErrors.length})</AlertTitle>
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      )}
      {/* Show number of rows removed due to empty cells and validation errors side by side */}
      {/* (removedRowsCount > 0 || validationErrors.length > 0) && (
        <Box display="flex" gap={2} mb={2}>
          {removedRowsCount > 0 && (
            <Alert severity="info" sx={{ flex: 1, mb: 0 }}>
              {removedRowsCount} row(s) with empty cells were automatically removed from your dataset.
            </Alert>
          )}
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ flex: 1, mb: 0 }}>
              <AlertTitle>Validation Errors ({validationErrors.length})</AlertTitle>
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      )*/}

      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Warnings ({validationWarnings.length})</AlertTitle>
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
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Validation Successful</AlertTitle>
          Your data looks good! You can proceed to the next step.
        </Alert>
      )}

      {hasSkippableRows && (
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={skipErrors} 
                onChange={handleSkipErrorsChange}
              />
            }
            label="Skip rows with errors and continue"
          />
          {skipErrors && skippedCount > 0 && (
            <>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                  Example errors for skipped rows:
                </Typography>
                <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
                  {validationErrors.slice(0, 5).map((error, idx) => (
                    <li key={idx} style={{ color: '#d32f2f' }}>{error}</li>
                  ))}
                </ul>
              </Box>
              {parsedData.length > 0 && (skippedCount / parsedData.length) > 0.5 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  More than 50% of your data will be skipped! Please check your column mapping or data format.
                </Alert>
              )}
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                {skippedCount} out of {parsedData.length} row(s) will be skipped ({Math.round((skippedCount / parsedData.length) * 100)}%).
              </Typography>
              <Box sx={{ width: 200, mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.round((skippedCount / parsedData.length) * 100)}
                  color="warning"
                />
              </Box>
            </>
          )}
        </Box>
      )}

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
            {filteredPreview.map((row, rowIndex) => (
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