import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, AlertTitle, Checkbox, FormControlLabel, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

const ValidateStep = ({ headerRow, validationErrors, validationWarnings, previewData, setParsedData, parsedData, skipErrors, setSkipErrors, setAllRowsInvalid }) => {
  const [filteredPreview, setFilteredPreview] = useState(previewData);
  const [skippedCount, setSkippedCount] = useState(0);
  const [allRowsInvalid, setAllRowsInvalidLocal] = useState(false);
  const [hasSkippableRows, setHasSkippableRows] = useState(false);

  useEffect(() => {
    // Extract row numbers from error messages (handle various formats)
    const errorRows = validationErrors
      .map(err => {
        // Try to match 'Row X:' or 'Row X -' or 'Row X '
        const match = err.match(/Row\s*(\d+)/i);
        return match ? parseInt(match[1], 10) - 1 : null;
      })
      .filter(idx => idx !== null);
    const uniqueErrorRows = Array.from(new Set(errorRows));
    const totalRows = parsedData ? parsedData.length : 0;
    const allInvalid = totalRows > 0 && uniqueErrorRows.length === totalRows;
    setAllRowsInvalidLocal(allInvalid);
    if (setAllRowsInvalid) setAllRowsInvalid(allInvalid);
    setHasSkippableRows(validationErrors.length > 0 && !allInvalid && uniqueErrorRows.length < totalRows);
    if (skipErrors && validationErrors.length > 0 && parsedData && !allInvalid) {
      const filtered = parsedData.filter((row, idx) => !uniqueErrorRows.includes(idx));
      setFilteredPreview(filtered.slice(0, 5));
      setSkippedCount(uniqueErrorRows.length);
      setParsedData(filtered);
    } else {
      setFilteredPreview(previewData);
      setSkippedCount(0);
    }
    // Debug: log error rows
    // console.log('Error rows:', uniqueErrorRows, 'Total:', totalRows, 'All invalid:', allInvalid, 'Skippable:', hasSkippableRows);
  }, [skipErrors, validationErrors, previewData, parsedData, setParsedData, setAllRowsInvalid]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Validate Data
      </Typography>
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Validation Errors</AlertTitle>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Validation Warnings</AlertTitle>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            {validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
      {allRowsInvalid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>All Rows Invalid</AlertTitle>
          All rows have errors. Please re-upload clean data.
        </Alert>
      )}
      {validationErrors.length > 0 && (
        <FormControlLabel
          control={<Checkbox checked={skipErrors} onChange={e => setSkipErrors(e.target.checked)} />}
          label="Skip rows with errors and continue"
        />
      )}
      {skipErrors && skippedCount > 0 && !allRowsInvalid && (
        <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
          {skippedCount} row(s) will be skipped.
        </Typography>
      )}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Data Preview
      </Typography>
      <Paper sx={{ maxWidth: 800, mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headerRow.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPreview.map((row, idx) => (
              <TableRow key={idx}>
                {headerRow.map((header) => (
                  <TableCell key={header}>{row[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ValidateStep; 