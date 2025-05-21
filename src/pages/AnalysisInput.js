import React, { useState } from 'react';
import { 
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import Papa from 'papaparse';
import { Upload, Save } from 'lucide-react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set, get } from 'firebase/database';
import { processAndUploadData, uploadRowsToFirestore } from './utils/dataProcessingUtils';

const expectedColumns = [
  'event-id',
  'visible',
  'timestamp',
  'location-long',
  'location-lat',
  'eobs:temperature',
  'gps:dop',
  'height-raw',
  'sensor-type',
  'individual-taxon-canonical-name',
  'tag-local-identifier',
  'individual-local-identifier',
  'study-name'
];

const AnalysisInput = () => {
  const [fileData, setFileData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [animalName, setAnimalName] = useState('');
  const [animalAge, setAnimalAge] = useState('');
  const [animalSex, setAnimalSex] = useState('');
  const [uploadInterval, setUploadInterval] = useState('60');
  const [animalSpecies, setAnimalSpecies] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const validateDataTypes = (results) => {
    const errors = [];
    
    results.data.forEach((row, index) => {
      if (index === 0) return;
      
      if (isNaN(parseInt(row['event-id']))) {
        errors.push(`Row ${index + 1}: event-id must be an integer`);
      }
      
      if (typeof row['visible'] !== 'boolean' && !['true', 'false'].includes(row['visible'].toLowerCase())) {
        errors.push(`Row ${index + 1}: visible must be a boolean`);
      }
      
      const lat = parseFloat(row['location-lat']);
      const long = parseFloat(row['location-long']);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push(`Row ${index + 1}: Invalid latitude`);
      }
      if (isNaN(long) || long < -180 || long > 180) {
        errors.push(`Row ${index + 1}: Invalid longitude`);
      }
      
      if (isNaN(parseInt(row['eobs:temperature']))) {
        errors.push(`Row ${index + 1}: temperature must be an integer`);
      }
    });
    
    return errors;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsValidating(true);
    setValidationErrors([]);
    setIsValid(false);
    setUploadStatus('');
    setUploadProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields;
        const missingColumns = expectedColumns.filter(col => !headers.includes(col));
        const extraColumns = headers.filter(col => !expectedColumns.includes(col));
        
        const errors = [];
        
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }
        
        if (extraColumns.length > 0) {
          errors.push(`Unexpected columns found: ${extraColumns.join(', ')}`);
        }

        const dataErrors = validateDataTypes(results);
        errors.push(...dataErrors);

        setValidationErrors(errors);
        setIsValid(errors.length === 0);
        setFileData(errors.length === 0 ? results.data : null);
        setIsValidating(false);
      },
      error: (error) => {
        setValidationErrors([`Error parsing file: ${error.message}`]);
        setIsValidating(false);
        setIsValid(false);
      }
    });
  };

  const handleUploadToFirebase = async () => {
    if (!selectedFile || !fileData) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setUploadMessage('Preparing upload...');
      
      // Compose animal details object
      const animalDetails = {
        name: animalName,
        age: animalAge,
        sex: animalSex,
        upload_interval: uploadInterval,
        species: animalSpecies
      };

      // Map the columns based on the expected structure
      const columnMappings = {
        latitude: 'location-lat',
        longitude: 'location-long',
        timestamp: 'timestamp',
        temperature: 'eobs:temperature',
        animalId: 'individual-local-identifier',
        species: 'individual-taxon-canonical-name'
      };

      // Configure timestamp settings
      const timestampConfig = {
        format: 'auto',  // Use auto format since we have a timestamp column
        hasDate: true,
        hasTime: true
      };

      // --- Create animal node and get animalId ---
      const database = getDatabase();
      const speciesKey = animalSpecies.replace(/\s+/g, '_') || 'UnknownSpecies';
      const speciesRef = dbRef(database, `AnalysisData/${speciesKey}`);
      let nextId = 1;
      const snapshot = await get(speciesRef);
      if (snapshot.exists()) {
        const ids = Object.keys(snapshot.val()).map(Number).filter(n => !isNaN(n));
        if (ids.length > 0) nextId = Math.max(...ids) + 1;
      }
      const animalId = String(nextId);
      const animalRef = dbRef(database, `AnalysisData/${speciesKey}/${animalId}`);
      await set(animalRef, {
        ...animalDetails,
        columnMappings,
        timestampConfig
      });
      setUploadMessage('Animal details uploaded. Uploading data rows...');

      // --- Upload data rows to Firestore in batches of 100 ---
      await uploadRowsToFirestore(
        fileData,
        speciesKey,
        animalId,
        animalDetails,
        setUploadProgress,
        setUploadStatus,
        setUploadMessage,
        100
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setValidationErrors([...validationErrors, `Upload error: ${error.message}`]);
      setUploadMessage('Upload failed due to an error.');
    }
  };

  return (
    <Paper sx={{ maxWidth: '800px', mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Data Analysis Input
      </Typography>
      
      <Box sx={{ 
        border: '2px dashed #ccc', 
        borderRadius: 2, 
        p: 3, 
        textAlign: 'center',
        mb: 3
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
            variant="outlined"
            component="span"
            startIcon={<Upload />}
            sx={{ mb: 1 }}
          >
            Upload CSV File
          </Button>
        </label>
        <Typography variant="body2" color="textSecondary">
          Upload your CSV file for analysis
        </Typography>
      </Box>

      {isValidating && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography color="primary" display="inline">
            Validating file...
          </Typography>
        </Box>
      )}

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

      {isValid && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Success</AlertTitle>
            File validation successful! {fileData?.length} rows loaded.
          </Alert>

          {/* Animal Details Preview */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Animal Details to be Uploaded
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                <Typography>{animalName || 'Not specified'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Species</Typography>
                <Typography>{animalSpecies || 'Not specified'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Age</Typography>
                <Typography>{animalAge || 'Not specified'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Sex</Typography>
                <Typography>{animalSex || 'Not specified'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Upload Interval</Typography>
                <Typography>{uploadInterval} minutes</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Data Preview */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Preview (First 5 rows)
            </Typography>
            <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(fileData[0] || {}).map((header) => (
                        <TableCell key={header}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fileData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Total rows to upload: {fileData.length}
            </Typography>
          </Paper>

          {/* Input Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto', mt: 2 }}>
            <TextField
              fullWidth
              label="Animal Name"
              value={animalName}
              onChange={e => setAnimalName(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={animalAge}
              onChange={e => setAnimalAge(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Sex"
              value={animalSex}
              onChange={e => setAnimalSex(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Upload Interval (minutes)"
              type="number"
              value={uploadInterval}
              onChange={e => setUploadInterval(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Species"
              value={animalSpecies}
              onChange={e => setAnimalSpecies(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleUploadToFirebase}
              disabled={uploadStatus === 'uploading'}
            >
              Save to Database
            </Button>
          </Box>
        </>
      )}

      {/* Upload Progress Section */}
      {(uploadStatus === 'uploading' || uploadStatus === 'verifying') && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload Progress
            </Typography>
            
            {/* Overall Progress */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                {uploadProgress}% Complete
              </Typography>
            </Box>

            {/* Data Upload Progress */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Data Upload Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {uploadProgress}%
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {uploadMessage}
              </Typography>
            </Box>

            {/* Status Message */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Upload in Progress</AlertTitle>
              {uploadMessage}
            </Alert>
          </Paper>
        </Box>
      )}

      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>Upload Complete</AlertTitle>
          {uploadMessage}
        </Alert>
      )}

      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Upload Failed</AlertTitle>
          {uploadMessage}
        </Alert>
      )}
    </Paper>
  );
};

export default AnalysisInput;