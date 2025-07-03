import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set, get, update } from 'firebase/database';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse';

// Cache for column detection results
const columnDetectionCache = new Map();

/**
 * Auto-detect column mappings based on headers and sample data
 * @param {string[]} headers - CSV header row
 * @param {Object[]} data - Parsed CSV data
 * @param {Object} currentMappings - Current column mappings
 * @param {Object} currentTimestampConfig - Current timestamp configuration
 * @returns {Object} Detected mappings and timestamp configuration
 */
export const autoDetectColumns = (headers, data, currentMappings, currentTimestampConfig) => {
  const cacheKey = JSON.stringify({
    headers,
    dataLength: data.length,
    currentMappings,
    currentTimestampConfig
  });

  if (columnDetectionCache.has(cacheKey)) {
    return columnDetectionCache.get(cacheKey);
  }

  const mapping = {...currentMappings};
  const timestampConf = {...currentTimestampConfig};
  
  // Helper to check if a column might be of a specific type
  const checkColumn = (header, sampleData, patterns) => {
    const lowerHeader = header.toLowerCase();
    
    // First check based on header names
    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => lowerHeader.includes(keyword))) {
        return type;
      }
    }
    
    // If no match by header, try to analyze sample data
    if (sampleData && sampleData.length > 0) {
      // For numeric columns, check ranges and patterns
      const sample = sampleData[0][header];
      if (sample) {
        const numValue = parseFloat(sample);
        
        // Latitude is usually between -90 and 90
        if (!isNaN(numValue) && numValue >= -90 && numValue <= 90 && patterns.latitude) {
          return 'latitude';
        }
        
        // Longitude is usually between -180 and 180
        if (!isNaN(numValue) && numValue >= -180 && numValue <= 180 && patterns.longitude) {
          return 'longitude';
        }
        
        // Temperature typically between -50 and 50 (in celsius)
        if (!isNaN(numValue) && numValue >= -50 && numValue <= 50 && patterns.temperature) {
          return 'temperature';
        }
        
        // Heart rate typically between 30 and 200
        if (!isNaN(numValue) && numValue >= 30 && numValue <= 200 && patterns.heartRate) {
          return 'heartRate';
        }
      }
    }
    
    return null;
  };
  
  // Define patterns for each column type
  const patterns = {
    latitude: ['lat', 'latitude', 'y-coordinate', 'y_coordinate'],
    longitude: ['lng', 'long', 'longitude', 'x-coordinate', 'x_coordinate'],
    timestamp: ['time', 'date', 'timestamp', 'datetime'],
    temperature: ['temp', 'temperature', 'celsius', 'fahrenheit'],
    heartRate: ['heart', 'pulse', 'bpm', 'rate'],
    animalId: ['id', 'animal', 'tag', 'identifier'],
    species: ['species', 'animal', 'type', 'category']
  };
  
  // Check for date and time columns separately
  const dateColumns = [];
  const timeColumns = [];
  
  // First pass: identify columns by name
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();
    
    // Check for date/time columns
    if (lowerHeader.includes('date') && !lowerHeader.includes('time')) {
      dateColumns.push(header);
    } else if (lowerHeader.includes('time') && !lowerHeader.includes('date')) {
      timeColumns.push(header);
    }
    
    // Try to match other columns
    for (const columnType of Object.keys(mapping)) {
      if (!mapping[columnType]) { // if not already mapped
        const detectedType = checkColumn(header, data, patterns);
        if (detectedType === columnType) {
          mapping[columnType] = header;
        }
      }
    }
  });
  
  // Configure timestamp approach based on detected columns
  if (dateColumns.length > 0 && timeColumns.length > 0) {
    timestampConf.combineColumns = true;
    timestampConf.dateColumn = dateColumns[0];
    timestampConf.timeColumn = timeColumns[0];
    timestampConf.format = 'custom';
  } else if (dateColumns.length > 0) {
    timestampConf.dateColumn = dateColumns[0];
    timestampConf.hasTime = false;
    timestampConf.format = 'custom';
  } else if (timeColumns.length > 0) {
    timestampConf.timeColumn = timeColumns[0];
    timestampConf.hasDate = true;
    timestampConf.format = 'custom';
  } else if (mapping.timestamp) {
    timestampConf.format = 'auto';
  } else {
    // If no timestamp columns detected, default to interval
    timestampConf.format = 'interval';
    timestampConf.hasDate = false;
    timestampConf.hasTime = false;
  }
  
  const result = { 
    detectedMappings: mapping,
    detectedTimestampConfig: timestampConf
  };
  columnDetectionCache.set(cacheKey, result);
  return result;
};

/**
 * Validate data based on column mappings
 * @param {Object[]} parsedData - Parsed CSV data
 * @param {Object} columnMappings - Column mappings
 * @param {Object} timestampConfig - Timestamp configuration
 * @param {boolean} checkRequiredColumns - Whether to check for required column mappings (default: true)
 * @returns {Object} Validation results
 */
export const validateData = (parsedData, columnMappings, timestampConfig, checkRequiredColumns = true) => {
  const errors = [];
  const warnings = [];
  
  // Check if required fields are mapped (only if requested)
  if (checkRequiredColumns) {
    if (!columnMappings.latitude) {
      errors.push('Latitude column must be selected');
    }
    if (!columnMappings.longitude) {
      errors.push('Longitude column must be selected');
    }
  }
  
  // Validate data if mappings are provided
  if (parsedData && parsedData.length > 0) {
    // Sample validation of first 100 rows
    const sampleData = parsedData.slice(0, Math.min(100, parsedData.length));
    
    sampleData.forEach((row, index) => {
      // Validate coordinates
      if (columnMappings.latitude) {
        const lat = parseFloat(row[columnMappings.latitude]);
        if (isNaN(lat)) {
          errors.push(`Row ${index + 1}: Invalid latitude value "${row[columnMappings.latitude]}"`);
        } else if (lat < -90 || lat > 90) {
          errors.push(`Row ${index + 1}: Latitude out of range: ${lat}`);
        }
      }
      
      if (columnMappings.longitude) {
        const lng = parseFloat(row[columnMappings.longitude]);
        if (isNaN(lng)) {
          errors.push(`Row ${index + 1}: Invalid longitude value "${row[columnMappings.longitude]}"`);
        } else if (lng < -180 || lng > 180) {
          errors.push(`Row ${index + 1}: Longitude out of range: ${lng}`);
        }
      }
      
      // Validate temperature if mapped
      if (columnMappings.temperature && row[columnMappings.temperature]) {
        const temp = parseFloat(row[columnMappings.temperature]);
        if (isNaN(temp)) {
          warnings.push(`Row ${index + 1}: Invalid temperature value "${row[columnMappings.temperature]}"`);
        } else if (temp < -100 || temp > 100) {
          warnings.push(`Row ${index + 1}: Unusual temperature value: ${temp}°C`);
        }
      }
      
      // Validate heart rate if mapped
      if (columnMappings.heartRate && row[columnMappings.heartRate]) {
        const rate = parseFloat(row[columnMappings.heartRate]);
        if (isNaN(rate)) {
          warnings.push(`Row ${index + 1}: Invalid heart rate value "${row[columnMappings.heartRate]}"`);
        } else if (rate < 20 || rate > 300) {
          warnings.push(`Row ${index + 1}: Unusual heart rate value: ${rate} BPM`);
        }
      }
      
      // Validate timestamp if using auto format
      if (timestampConfig.format === 'auto' && columnMappings.timestamp) {
        const timestamp = row[columnMappings.timestamp];
        if (timestamp && isNaN(Date.parse(timestamp))) {
          warnings.push(`Row ${index + 1}: Cannot parse timestamp: "${timestamp}"`);
        }
      }
      
      // Validate date/time columns if using custom format
      if (timestampConfig.format === 'custom') {
        if (timestampConfig.dateColumn && row[timestampConfig.dateColumn]) {
          const date = row[timestampConfig.dateColumn];
          if (isNaN(Date.parse(date))) {
            warnings.push(`Row ${index + 1}: Cannot parse date: "${date}"`);
          }
        }
        
        if (timestampConfig.timeColumn && row[timestampConfig.timeColumn]) {
          const time = row[timestampConfig.timeColumn];
          // Basic time format check (hh:mm:ss or hh:mm)
          if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
            warnings.push(`Row ${index + 1}: Time format invalid: "${time}"`);
          }
        }
      }
    });
  } else {
    errors.push('No data found in the file');
  }
  
  // Limit the number of errors/warnings to display
  const maxMessages = 10;
  let limitedErrors = [...errors];
  let limitedWarnings = [...warnings];
  
  if (limitedErrors.length > maxMessages) {
    const remaining = limitedErrors.length - maxMessages;
    limitedErrors = limitedErrors.slice(0, maxMessages);
    limitedErrors.push(`...and ${remaining} more errors`);
  }
  
  if (limitedWarnings.length > maxMessages) {
    const remaining = limitedWarnings.length - maxMessages;
    limitedWarnings = limitedWarnings.slice(0, maxMessages);
    limitedWarnings.push(`...and ${remaining} more warnings`);
  }
  
  // Generate preview data with processed timestamps
  const processedPreviewData = generatePreviewData(parsedData.slice(0, 5), timestampConfig, columnMappings);
  
  return {
    isValid: errors.length === 0,
    errors: limitedErrors,
    warnings: limitedWarnings,
    processedPreviewData
  };
};

/**
 * Generate preview data with processed timestamps
 * @param {Object[]} data - Data to process
 * @param {Object} timestampConfig - Timestamp configuration
 * @param {Object} columnMappings - Column mappings
 * @returns {Object[]} Processed preview data
 */
export const generatePreviewData = (data, timestampConfig, columnMappings) => {
  if (!data || data.length === 0) return [];
  return data.map((row, index) => {
    const processed = { ...row };
    let timestamp;
    
    // Handle combined date and time columns
    if (columnMappings.dateColumn && columnMappings.timeColumn && row[columnMappings.dateColumn] && row[columnMappings.timeColumn]) {
      const date = row[columnMappings.dateColumn];
      const time = row[columnMappings.timeColumn];
      // Ensure proper date format (YYYY-MM-DD)
      const formattedDate = date.includes('-') ? date : date.split('/').reverse().join('-');
      // Ensure proper time format (HH:mm:ss)
      const formattedTime = time.includes(':') ? time : `${time}:00`;
      processed._processedTimestamp = `${formattedDate}T${formattedTime}`;
    } else if (timestampConfig.format === 'auto' && columnMappings.timestamp) {
      const ts = row[columnMappings.timestamp];
      const match = ts && ts.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/);
      if (match) {
        processed._processedTimestamp = `${match[1]}T${match[2]}`;
      } else {
        timestamp = new Date(ts);
        processed._processedTimestamp = isNaN(timestamp) ? 'Invalid date' : timestamp.toISOString();
      }
    } else if (timestampConfig.format === 'custom') {
      let dateStr = '';
      let timeStr = '';
      if (timestampConfig.hasDate && timestampConfig.dateColumn) {
        dateStr = row[timestampConfig.dateColumn] || timestampConfig.startDate;
      } else {
        dateStr = timestampConfig.startDate;
      }
      if (timestampConfig.hasTime && timestampConfig.timeColumn) {
        timeStr = row[timestampConfig.timeColumn] || timestampConfig.startTime;
      } else {
        timeStr = timestampConfig.startTime;
      }
      processed._processedTimestamp = `${dateStr}T${timeStr}`;
    } else if (timestampConfig.format === 'interval') {
      const startDateTime = new Date(`${timestampConfig.startDate}T${timestampConfig.startTime}`);
      const intervalMs = timestampConfig.interval * 60 * 1000;
      timestamp = new Date(startDateTime.getTime() + index * intervalMs);
      processed._processedTimestamp = isNaN(timestamp) ? 'Invalid date' : timestamp.toISOString();
    }
    return processed;
  });
};

// Utility to sanitize object keys for Firebase
function sanitizeKeys(obj) {
  const forbidden = /[.#$/[\]]/g;
  const newObj = {};
  for (const key in obj) {
    const cleanKey = key.replace(forbidden, '_');
    newObj[cleanKey] = obj[key];
  }
  return newObj;
}

// Utility to group data by date and time
function groupDataByDateTime(data) {
  const grouped = {};
  data.forEach(row => {
    let date = row.date;
    let time = row.time;
    if (!date || !time) {
      const ts = row.timestamp || row.Timestamp;
      if (ts) {
        const [d, t] = ts.split('T');
        date = date || d;
        time = time || (t ? t.substring(0, 8) : undefined);
      }
    }
    if (!date || !time) return;
    if (!grouped[date]) grouped[date] = {};
    grouped[date][time] = {
      Latitude: row.Latitude !== undefined ? row.Latitude : row.latitude,
      Longitude: row.Longitude !== undefined ? row.Longitude : row.longitude
    };
  });
  return grouped;
}

/**
 * Process and upload data to Firebase
 * @param {Object[]} parsedData - Parsed CSV data
 * @param {File} selectedFile - The original CSV file
 * @param {Object} columnMappings - Column mappings
 * @param {Object} timestampConfig - Timestamp configuration
 * @param {Function} setUploadProgress - Function to update upload progress
 * @param {Object} animalDetails - Animal details
 * @param {Object} renamedHeaders - Renamed headers
 * @returns {Promise<void>}
 */
export const processAndUploadData = async (
  parsedData,
  selectedFile,
  columnMappings,
  timestampConfig,
  setUploadProgress,
  animalDetails,
  renamedHeaders
) => {
  try {
    // Preprocess: add 'date' and 'time' fields if missing, using timestamp/Timestamp
    const preprocessed = parsedData.map(row => {
      // Check for any case variant of 'date' and 'time'
      const hasDate = Object.keys(row).some(k => k.toLowerCase() === 'date');
      const hasTime = Object.keys(row).some(k => k.toLowerCase() === 'time');
      let date = hasDate ? row[Object.keys(row).find(k => k.toLowerCase() === 'date')] : undefined;
      let time = hasTime ? row[Object.keys(row).find(k => k.toLowerCase() === 'time')] : undefined;
      const ts = row.timestamp || row.Timestamp;
      if ((!date || !time) && ts) {
        const [d, t] = ts.split('T');
        date = date || d;
        time = time || (t ? t.substring(0, 8) : undefined);
      }
      // Only add if they have values
      const newRow = { ...row };
      if (date !== undefined) newRow.date = date;
      if (time !== undefined) newRow.time = time;
      return newRow;
    });

    // Remap keys to renamed headers
    let renamedData = preprocessed;
    if (renamedHeaders && Object.keys(renamedHeaders).length > 0) {
      renamedData = preprocessed.map(row => {
        const newRow = {};
        Object.keys(row).forEach(origKey => {
          const newKey = renamedHeaders[origKey] || origKey;
          newRow[newKey] = row[origKey];
        });
        return newRow;
      });
    }

    // Sanitize keys and group data by date and time
    const sanitized = renamedData.map(sanitizeKeys);
    const groupedData = groupDataByDateTime(sanitized);
    console.log("Grouped data to be saved:", groupedData);

    // --- NEW LOGIC: Use species as grouping key ---
    const database = getDatabase();
    const species = (animalDetails.species || columnMappings.species || 'UnknownSpecies').replace(/\s+/g, '_');
    const speciesRef = dbRef(database, `AnalysisData/${species}`);

    // Get next available ID for this species
    let nextId = 1;
    const snapshot = await get(speciesRef);
    if (snapshot.exists()) {
      const ids = Object.keys(snapshot.val()).map(Number).filter(n => !isNaN(n));
      if (ids.length > 0) nextId = Math.max(...ids) + 1;
    }
    const animalId = String(nextId);

    // Write to AnalysisData/{species}/{animalId}
    const animalRef = dbRef(database, `AnalysisData/${species}/${animalId}`);
    await set(animalRef, animalDetails);
    setUploadProgress(50);

    // --- NEW LOGIC: Produce CSV file and upload to Firebase Storage ---
    // Use renamed headers for CSV
    const csv = Papa.unparse(renamedData);
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const storage = getStorage();
    const csvFileName = `PredictiveData/${species}/${animalId}.csv`;
    const csvFileRef = storageRef(storage, csvFileName);
    const csvUploadTask = await uploadBytes(csvFileRef, csvBlob);
    const csvDownloadURL = await getDownloadURL(csvUploadTask.ref);

    // Store the CSV download URL in the Realtime Database
    await set(animalRef, { ...animalDetails, csvDownloadURL });
    setUploadProgress(100);

    return { success: true, downloadURL: csvDownloadURL };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Upload rows individually to Firebase, show progress, and verify upload.
 * @param {Object[]} rows - Array of data rows to upload
 * @param {string} species - Animal species (used in path)
 * @param {string} animalId - Animal ID (used in path)
 * @param {Function} setUploadProgress - Function to update upload progress
 * @param {Function} setUploadStatus - Function to update upload status
 * @param {Function} setUploadMessage - Function to update upload message
 */
export const uploadRowsIndividually = async (
  rows,
  species,
  animalId,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage
) => {
  const database = getDatabase();
  const dataRef = dbRef(database, `AnalysisData/${species}/${animalId}/data`);
  let count = 0;

  setUploadStatus && setUploadStatus('uploading');

  for (const row of rows) {
    await push(dataRef, row);
    count++;
    if (setUploadProgress) setUploadProgress(Math.round((count / rows.length) * 100));
    if (setUploadMessage) setUploadMessage(`Uploading row ${count} of ${rows.length}`);
  }

  setUploadStatus && setUploadStatus('verifying');
  setUploadMessage && setUploadMessage('Verifying uploaded data...');

  // Read back the uploaded data to confirm
  const snapshot = await get(dataRef);
  if (snapshot.exists()) {
    const uploadedCount = Object.keys(snapshot.val()).length;
    setUploadMessage && setUploadMessage(`Upload complete! ${uploadedCount} rows uploaded and verified.`);
    setUploadStatus && setUploadStatus('success');
  } else {
    setUploadMessage && setUploadMessage('Upload failed: No data found after upload.');
    setUploadStatus && setUploadStatus('error');
  }
};

/**
 * Upload rows in chunks to Firebase, show progress, and verify upload.
 * @param {Object[]} rows - Array of data rows to upload
 * @param {string} species - Animal species (used in path)
 * @param {string} animalId - Animal ID (used in path)
 * @param {Function} setUploadProgress - Function to update upload progress
 * @param {Function} setUploadStatus - Function to update upload status
 * @param {Function} setUploadMessage - Function to update upload message
 * @param {number} chunkSize - Number of rows per chunk (default: 500)
 */
export const uploadRowsInChunks = async (
  rows,
  species,
  animalId,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage,
  chunkSize = 500
) => {
  const database = getDatabase();
  const dataRef = dbRef(database, `AnalysisData/${species}/${animalId}/data`);
  let count = 0;
  setUploadStatus && setUploadStatus('uploading');

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const updates = {};
    chunk.forEach(row => {
      // Use push-like keys for uniqueness
      const newKey = dbRef(database).push().key;
      updates[newKey] = row;
    });
    await update(dataRef, updates);
    count += chunk.length;
    if (setUploadProgress) setUploadProgress(Math.round((count / rows.length) * 100));
    if (setUploadMessage) setUploadMessage(`Uploaded ${count} of ${rows.length} rows`);
  }

  setUploadStatus && setUploadStatus('verifying');
  setUploadMessage && setUploadMessage('Verifying uploaded data...');

  // Read back the uploaded data to confirm
  const snapshot = await get(dataRef);
  if (snapshot.exists()) {
    const uploadedCount = Object.keys(snapshot.val()).length;
    setUploadMessage && setUploadMessage(`Upload complete! ${uploadedCount} rows uploaded and verified.`);
    setUploadStatus && setUploadStatus('success');
  } else {
    setUploadMessage && setUploadMessage('Upload failed: No data found after upload.');
    setUploadStatus && setUploadStatus('error');
  }
};

/**
 * Upload rows in batches to Firestore and store animal details.
 * @param {Object[]} rows - Array of data rows to upload
 * @param {string} species - Animal species (used in path)
 * @param {string} animalId - Animal ID (used in path)
 * @param {Object} animalDetails - Animal details to store as a document
 * @param {Function} setUploadProgress
 * @param {Function} setUploadStatus
 * @param {Function} setUploadMessage
 * @param {number} batchSize
 */
export const uploadRowsToFirestore = async (
  rows,
  species,
  animalId,
  animalDetails,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage,
  batchSize = 100
) => {
  const db = getFirestore();
  // Store animal details as a document
  await setDoc(doc(db, 'AnalysisData', species, animalId), animalDetails);
  const dataCol = collection(db, 'AnalysisData', species, animalId, 'data');
  let count = 0;
  setUploadStatus && setUploadStatus('uploading');

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = rows.slice(i, i + batchSize);
    chunk.forEach((row) => {
      const docRef = doc(dataCol); // auto-ID
      batch.set(docRef, row);
    });
    await batch.commit();
    count += chunk.length;
    if (setUploadProgress) setUploadProgress(Math.round((count / rows.length) * 100));
    if (setUploadMessage) setUploadMessage(`Uploaded ${count} of ${rows.length} rows`);
  }

  setUploadStatus && setUploadStatus('success');
  setUploadMessage && setUploadMessage(`Upload complete! ${rows.length} rows uploaded to Firestore.`);
};