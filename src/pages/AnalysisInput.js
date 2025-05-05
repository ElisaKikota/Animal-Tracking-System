import React, { useState } from 'react';
import { 
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import Papa from 'papaparse';
import { Upload, Save } from 'lucide-react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set } from 'firebase/database';

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

      // Upload file to Firebase Storage
      const storage = getStorage();
      const timestamp = new Date().getTime();
      const fileName = `analysis_data/${timestamp}_${selectedFile.name}`;
      const fileRef = storageRef(storage, fileName);

      // Upload the file
      const uploadTask = await uploadBytes(fileRef, selectedFile);
      setUploadProgress(50);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      // Store metadata in Realtime Database
      const database = getDatabase();
      const analysisRef = dbRef(database, 'analysis_data');
      const newAnalysisRef = push(analysisRef);
      
      await set(newAnalysisRef, {
        fileName: selectedFile.name,
        uploadDate: timestamp,
        fileURL: downloadURL,
        rowCount: fileData.length,
        status: 'uploaded'
      });

      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setValidationErrors([...validationErrors, `Upload error: ${error.message}`]);
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

      {uploadStatus === 'uploading' && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>Upload Complete</AlertTitle>
          File successfully uploaded to database!
        </Alert>
      )}

      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Upload Failed</AlertTitle>
          There was an error uploading the file. Please try again.
        </Alert>
      )}
    </Paper>
  );
};

export default AnalysisInput;