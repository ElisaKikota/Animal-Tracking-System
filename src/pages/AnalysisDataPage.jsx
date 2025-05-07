import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';
import Papa from 'papaparse';




// Important: Import each component with explicit path
import UploadStep from './steps/UploadStep';
import ValidateStep from './steps/ValidateStep';
import ColumnMappingStep from './steps/ColumnMappingStep';
import TimestampConfigStep from './steps/TimestampConfigStep';
import PreviewAndUploadStep from './steps/PreviewAndUploadStep';
import UploadCompleteStep from './steps/UploadCompleteStep';

// Import utility functions
import { 
  autoDetectColumns, 
  validateData, 
  
  processAndUploadData 
} from './utils/dataProcessingUtils';

const AnalysisDataPage = () => {
  // File and data states
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [parsedData, setParsedData] = useState(null);
  const [headerRow, setHeaderRow] = useState([]);

  // Validation states
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);

  // Column mapping states
  const [columnMappings, setColumnMappings] = useState({
    latitude: '',
    longitude: '',
    timestamp: '',
    temperature: '',
    heartRate: '',
    animalId: '',
    species: ''
  });
  
  // Timestamp configuration
  const [timestampConfig, setTimestampConfig] = useState({
    format: 'auto', // 'auto', 'custom', 'interval'
    startDate: new Date().toISOString().split('T')[0],
    startTime: '00:00',
    interval: 60, // in minutes
    hasDate: true,
    hasTime: true,
    dateColumn: '',
    timeColumn: '',
    combineColumns: false
  });

  // Upload states
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // UI states
  const [activeStep, setActiveStep] = useState(0);
  const [previewData, setPreviewData] = useState([]);

  const steps = [
    'Upload CSV',
    'Validate Data',
    'Map Columns',
    'Configure Timestamps',
    'Preview & Upload'
  ];

  // Handle file selection
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationErrors([]);
    setValidationWarnings([]);
    setUploadStatus('');
    setUploadProgress(0);
    setActiveStep(0);

    // Parse the CSV file
    setIsValidating(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        setHeaderRow(headers);
        setParsedData(results.data || []);
        setPreviewData(results.data?.slice(0, 5) || []);
        setIsValidating(false);
        
        // Auto-detect possible column mappings
        if (headers.length > 0 && results.data && results.data.length > 0) {
          const { detectedMappings, detectedTimestampConfig } = 
            autoDetectColumns(headers, results.data, columnMappings, timestampConfig);
          setColumnMappings(detectedMappings);
          setTimestampConfig(detectedTimestampConfig);
        }
      },
      error: (error) => {
        setValidationErrors([`Error parsing file: ${error.message}`]);
        setIsValidating(false);
      }
    });
  };

  // Handle validation
  const handleValidation = () => {
    if (!parsedData || parsedData.length === 0) {
      setValidationErrors(['No data to validate']);
      return false;
    }
    
    const { isValid, errors, warnings, processedPreviewData } = validateData(
      parsedData,
      columnMappings,
      timestampConfig
    );
    
    setValidationErrors(errors || []);
    setValidationWarnings(warnings || []);
    if (processedPreviewData && processedPreviewData.length > 0) {
      setPreviewData(processedPreviewData);
    }
    
    return isValid;
  };

  // Handle data upload
  const handleDataUpload = async () => {
    if (!parsedData || !selectedFile) {
      setValidationErrors(['No data to upload']);
      return;
    }
    
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      await processAndUploadData(
        parsedData,
        selectedFile,
        columnMappings,
        timestampConfig,
        setUploadProgress
      );
      
      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setValidationErrors([...validationErrors, `Upload error: ${error.message}`]);
    }
  };

  // Step navigation handlers
  const handleNext = () => {
    if (activeStep === 1) {
      const isValid = handleValidation();
      if (!isValid) return;
    }
    
    if (activeStep === 4) {
      handleDataUpload();
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Render step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <UploadStep 
            selectedFile={selectedFile} 
            handleFileUpload={handleFileUpload}
            isValidating={isValidating}
          />
        );
      case 1:
        return (
          <ValidateStep 
            headerRow={headerRow}
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
            previewData={previewData.slice(0, 3)}
          />
        );
      case 2:
        return (
          <ColumnMappingStep 
            headerRow={headerRow}
            columnMappings={columnMappings}
            setColumnMappings={setColumnMappings}
            previewData={previewData}
          />
        );
      case 3:
        return (
          <TimestampConfigStep 
            timestampConfig={timestampConfig}
            setTimestampConfig={setTimestampConfig}
            headerRow={headerRow}
            columnMappings={columnMappings}
          />
        );
      case 4:
        return (
          <PreviewAndUploadStep 
            previewData={previewData}
            uploadStatus={uploadStatus}
            uploadProgress={uploadProgress}
            columnMappings={columnMappings}
          />
        );
      case 5:
        return <UploadCompleteStep />;
      default:
        return <div>Unknown step</div>;
    }
  };

  // Console log to help with debugging
  useEffect(() => {
    console.log('AnalysisDataPage rendered', {
      activeStep,
      headerRow: headerRow?.length,
      parsedData: parsedData?.length,
      steps
    });
  }, [activeStep, headerRow, parsedData]);

  return (
    <Container maxWidth="lg" className="standard-page">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Analysis Data Upload
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ChevronLeft />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? <Save /> : <ChevronRight />}
              disabled={!selectedFile || isValidating || 
                      (activeStep === 4 && uploadStatus === 'uploading') || 
                      (activeStep === 4 && uploadStatus === 'success')}
            >
              {activeStep === steps.length - 1 ? 'Upload to Database' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AnalysisDataPage;