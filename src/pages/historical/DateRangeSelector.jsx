import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { CalendarIcon } from 'lucide-react';

const DateRangeSelector = ({ startDate, endDate, onDateRangeChange }) => {
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    onDateRangeChange({
      startDate: newStartDate,
      endDate: endDate
    });
  };

  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    onDateRangeChange({
      startDate: startDate,
      endDate: newEndDate
    });
  };

  return (
    <Box className="date-range-selector">
      <Typography variant="h6" className="section-title">
        <CalendarIcon size={20} />
        Select Date Range
      </Typography>
      <Box className="date-inputs">
        <TextField
          label="Start Date"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
          className="date-input"
        />
        <TextField
          label="End Date"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
          className="date-input"
        />
      </Box>
    </Box>
  );
};

export default DateRangeSelector;