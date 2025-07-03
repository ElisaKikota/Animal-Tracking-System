import React, { useState, useEffect, useMemo } from 'react';
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
import AnimalDetailsStep from './steps/AnimalDetailsStep';

// Import utility functions
import { 
  validateData, 
  processAndUploadData,
  uploadRowsToFirestore,
  autoDetectColumns
} from './utils/dataProcessingUtils';

// Cache for processed data
const dataCache = new Map();

// Utility to remove rows with any empty/null/undefined cell
function removeRowsWithEmptyCells(data) {
  return data.filter(row =>
    Object.values(row).every(
      value => value !== null && value !== undefined && String(value).trim() !== ''
    )
  );
}

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
    dateColumn: '',
    timeColumn: '',
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

  const [animalDetails, setAnimalDetails] = useState({
    category: '',
    name: '',
    age: '',
    sex: ''
  });

  const [skipErrors, setSkipErrors] = useState(false);
  const [allRowsInvalid, setAllRowsInvalid] = useState(false);
  const [removedRowsCount, setRemovedRowsCount] = useState(0);
  const [originalRowsCount, setOriginalRowsCount] = useState(0);

  const [hasBlockingErrors, setHasBlockingErrors] = useState(false);

  const [renamedHeaders, setRenamedHeaders] = useState({});

  const steps = [
    'Upload CSV',
    'Validate Data',
    'Map Columns',
    'Configure Timestamps',
    'Animal Details',
    'Preview & Upload'
  ];

  // Memoize the processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!parsedData) return null;
    
    const cacheKey = JSON.stringify({
      data: parsedData,
      mappings: columnMappings,
      config: timestampConfig
    });
    
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey);
    }
    
    const { processedPreviewData } = validateData(
      parsedData,
      columnMappings,
      timestampConfig
    );
    
    dataCache.set(cacheKey, processedPreviewData);
    return processedPreviewData;
  }, [parsedData, columnMappings, timestampConfig]);

  // Update preview data when processed data changes
  useEffect(() => {
    if (processedData) {
      setPreviewData(processedData);
    }
  }, [processedData]);

  // Handle file upload with optimized parsing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setParsedData(null);
    setHeaderRow([]);
    setOriginalRowsCount(0);
    setRemovedRowsCount(0);
    setRenamedHeaders({}); // Reset renamed headers on new file

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert strings to numbers where appropriate
      transformHeader: header => header.trim(), // Clean up header names
      complete: (results) => {
        const headers = results.meta.fields;
        setHeaderRow(headers);
        // Auto-detect mappings and suggest standard header names
        const { detectedMappings } = autoDetectColumns(headers, results.data, {}, {});
        // Suggest standard names for renaming
        const standardNames = {};
        headers.forEach(h => {
          // If detectedMappings maps a standard field to this header, use the standard name
          const stdName = Object.keys(detectedMappings).find(key => detectedMappings[key] === h);
          if (stdName && ['latitude','longitude','timestamp','temperature','heartRate','animalId','species'].includes(stdName)) {
            // Capitalize for display
            standardNames[h] = stdName.charAt(0).toUpperCase() + stdName.slice(1).replace(/([A-Z])/g, ' $1').trim();
          } else {
            standardNames[h] = h;
          }
        });
        setRenamedHeaders(standardNames);
        // Optionally, set columnMappings to detectedMappings for user convenience
        setColumnMappings(detectedMappings);
        
        // Process data in chunks to prevent UI blocking
        const chunkSize = 1000;
        const chunks = [];
        for (let i = 0; i < results.data.length; i += chunkSize) {
          chunks.push(results.data.slice(i, i + chunkSize));
        }

        let processedData = [];
        chunks.forEach(chunk => {
          const validRows = removeRowsWithEmptyCells(chunk);
          processedData = processedData.concat(validRows);
        });

        setOriginalRowsCount(results.data.length);
        setRemovedRowsCount(results.data.length - processedData.length);
        setParsedData(processedData);
        setIsValidating(false);
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
      setHasBlockingErrors(true);
      return false;
    }
    
    // Do NOT check for required columns in Validate Data step
    const { isValid, errors, warnings, processedPreviewData } = validateData(
      parsedData,
      columnMappings,
      timestampConfig,
      false // <--- do not check required columns here
    );
    
    setValidationErrors(errors || []);
    setValidationWarnings(warnings || []);
    
    // Only treat file/data issues as blocking in validation step
    const blockingErrorPatterns = [
      /No data found/i
    ];
    const hasBlocking = (errors || []).some(err => blockingErrorPatterns.some(pat => pat.test(err)));
    setHasBlockingErrors(hasBlocking);
    
    // Update the preview data with processed data
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
      
      const result = await processAndUploadData(
        parsedData,
        selectedFile,
        columnMappings,
        timestampConfig,
        setUploadProgress,
        animalDetails,
        renamedHeaders
      );
      
      // Also upload to Firestore with the same structure
      const species = (animalDetails.species || columnMappings.species || 'UnknownSpecies').replace(/\s+/g, '_');
      const animalId = String(Math.floor(Math.random() * 1000)); // Generate a random ID for Firestore
      await uploadRowsToFirestore(
        parsedData,
        species,
        animalId,
        animalDetails,
        setUploadProgress,
        setUploadStatus,
        (msg) => console.log(msg)
      );
      
      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setValidationErrors([...validationErrors, `Upload error: ${error.message}`]);
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (activeStep === 1) {
      // Validate data before proceeding
      if (!handleValidation()) {
        return;
      }
      // If skipErrors is true, filter parsedData and update it
      if (skipErrors && validationErrors.length > 0) {
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
        // Also update preview data to maintain consistency
        setPreviewData(filtered.slice(0, 5));
      }
    }
    if (activeStep === 5) {
      // Upload to database on Preview & Upload step
      await handleDataUpload();
      setActiveStep((prevStep) => prevStep + 1);
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
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
            setParsedData={setParsedData}
            parsedData={parsedData}
            skipErrors={skipErrors}
            setSkipErrors={setSkipErrors}
            setAllRowsInvalid={setAllRowsInvalid}
            columnMappings={columnMappings}
            removedRowsCount={removedRowsCount}
            originalRowsCount={originalRowsCount}
          />
        );
      case 2:
        // In Map Columns step, check for required columns
        return (
          <ColumnMappingStep 
            headerRow={headerRow}
            columnMappings={columnMappings}
            setColumnMappings={setColumnMappings}
            previewData={previewData}
            validateData={validateData}
            parsedData={parsedData}
            timestampConfig={timestampConfig}
            renamedHeaders={renamedHeaders}
            setRenamedHeaders={setRenamedHeaders}
          />
        );
      case 3:
        // If both dateColumn and timeColumn are mapped, preselect custom format
        const autoCustomFormat = columnMappings.dateColumn && columnMappings.timeColumn ? 'custom' : timestampConfig.format;
        return (
          <TimestampConfigStep 
            timestampConfig={{ ...timestampConfig, format: autoCustomFormat, dateColumn: columnMappings.dateColumn, timeColumn: columnMappings.timeColumn }}
            setTimestampConfig={setTimestampConfig}
            headerRow={headerRow}
            columnMappings={columnMappings}
            previewData={previewData}
          />
        );
      case 4:
        return (
          <AnimalDetailsStep
            animalDetails={animalDetails}
            setAnimalDetails={setAnimalDetails}
          />
        );
      case 5:
        return (
          <PreviewAndUploadStep 
            previewData={previewData}
            uploadStatus={uploadStatus}
            uploadProgress={uploadProgress}
            columnMappings={columnMappings}
            animalDetails={animalDetails}
          />
        );
      case 6:
        return <UploadCompleteStep 
          originalRows={originalRowsCount}
          removedRows={removedRowsCount}
          remainingRows={originalRowsCount - removedRowsCount}
        />;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, headerRow, parsedData]);

  // Add this before the return statement
  const requiredColumnsMapped = columnMappings.latitude && columnMappings.longitude &&
    (columnMappings.timestamp || (columnMappings.dateColumn && columnMappings.timeColumn));

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
            {/* Only show Next/Upload button if not on or past the last step */}
            {activeStep < steps.length && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? <Save /> : <ChevronRight />}
                disabled={
                  !selectedFile || 
                  isValidating || 
                  (activeStep === 5 && uploadStatus === 'uploading') || 
                  (activeStep === 5 && uploadStatus === 'success') ||
                  (activeStep === 1 && (allRowsInvalid || hasBlockingErrors)) ||
                  (activeStep === 2 && !requiredColumnsMapped)
                }
              >
                {activeStep === steps.length - 1 ? 'Upload to Database' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AnalysisDataPage;