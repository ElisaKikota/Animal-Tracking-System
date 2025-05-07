// src/pages/PieChart.js
import React, { useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Typography } from '@mui/material';
import './chartConfig';  // Remove the unused import and just import the file

function PieChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    // Store the current value in a variable to use in cleanup
    const currentChart = chartRef.current;
    
    return () => {
      if (currentChart) {
        currentChart.destroy();
      }
    };
  }, []);

  const chartData = {
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Pie ref={chartRef} data={chartData} options={options} />
  );
}

export default PieChart;