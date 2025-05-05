import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set } from 'firebase/database';

/**
 * Auto-detect column mappings based on headers and sample data
 * @param {string[]} headers - CSV header row
 * @param {Object[]} data - Parsed CSV data
 * @param {Object} currentMappings - Current column mappings
 * @param {Object} currentTimestampConfig - Current timestamp configuration
 * @returns {Object} Detected mappings and timestamp configuration
 */
export const autoDetectColumns = (headers, data, currentMappings, currentTimestampConfig) => {
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
  
  return { 
    detectedMappings: mapping,
    detectedTimestampConfig: timestampConf
  };
};

/**
 * Validate data based on column mappings
 * @param {Object[]} parsedData - Parsed CSV data
 * @param {Object} columnMappings - Column mappings
 * @param {Object} timestampConfig - Timestamp configuration
 * @returns {Object} Validation results
 */
export const validateData = (parsedData, columnMappings, timestampConfig) => {
  const errors = [];
  const warnings = [];
  
  // Check if required fields are mapped
  if (!columnMappings.latitude) {
    errors.push('Latitude column must be selected');
  }
  
  if (!columnMappings.longitude) {
    errors.push('Longitude column must be selected');
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
    const processed = {...row};
    
    // Process timestamp based on configuration
    let timestamp;
    
    if (timestampConfig.format === 'auto' && columnMappings.timestamp) {
      timestamp = new Date(row[columnMappings.timestamp]);
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
      
      timestamp = new Date(`${dateStr}T${timeStr}`);
    } else if (timestampConfig.format === 'interval') {
      // Calculate timestamp based on row index and interval
      const startDateTime = new Date(`${timestampConfig.startDate}T${timestampConfig.startTime}`);
      const intervalMs = timestampConfig.interval * 60 * 1000; // convert minutes to ms
      timestamp = new Date(startDateTime.getTime() + index * intervalMs);
    }
    
    // Add processed timestamp to the data
    processed._processedTimestamp = isNaN(timestamp) ? 'Invalid date' : timestamp.toISOString();
    
    return processed;
  });
};

/**
 * Process and upload data to Firebase
 * @param {Object[]} parsedData - Parsed CSV data
 * @param {File} selectedFile - The original CSV file
 * @param {Object} columnMappings - Column mappings
 * @param {Object} timestampConfig - Timestamp configuration
 * @param {Function} setUploadProgress - Function to update upload progress
 * @returns {Promise<void>}
 */
export const processAndUploadData = async (
  parsedData,
  selectedFile,
  columnMappings,
  timestampConfig,
  setUploadProgress
) => {
  // Process data for upload
  const processedData = parsedData.map((row, index) => {
    // Get coordinates
    const lat = parseFloat(row[columnMappings.latitude]);
    const lng = parseFloat(row[columnMappings.longitude]);
    
    // Process timestamp
    let timestamp;
    if (timestampConfig.format === 'auto' && columnMappings.timestamp) {
      timestamp = new Date(row[columnMappings.timestamp]);
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
      
      timestamp = new Date(`${dateStr}T${timeStr}`);
    } else if (timestampConfig.format === 'interval') {
      const startDateTime = new Date(`${timestampConfig.startDate}T${timestampConfig.startTime}`);
      const intervalMs = timestampConfig.interval * 60 * 1000;
      timestamp = new Date(startDateTime.getTime() + index * intervalMs);
    }
    
    // Format the data
    const dataPoint = {
      location: {
        Lat: lat,
        Long: lng
      },
      timestamp: timestamp.toISOString(),
      date: timestamp.toISOString().split('T')[0],
      time: timestamp.toISOString().split('T')[1].substring(0, 8)
    };
    
    // Add optional fields if available
    if (columnMappings.temperature && row[columnMappings.temperature]) {
      dataPoint.temperature = parseFloat(row[columnMappings.temperature]);
    }
    
    if (columnMappings.heartRate && row[columnMappings.heartRate]) {
      dataPoint.heartRate = parseFloat(row[columnMappings.heartRate]);
    }
    
    if (columnMappings.animalId && row[columnMappings.animalId]) {
      dataPoint.animalId = row[columnMappings.animalId];
    }
    
    if (columnMappings.species && row[columnMappings.species]) {
      dataPoint.species = row[columnMappings.species];
    }
    
    return dataPoint;
  });
  
  setUploadProgress(20);
  
  // Upload original file to Firebase Storage
  const storage = getStorage();
  const timestamp = new Date().getTime();
  const fileName = `analysis_data/${timestamp}_${selectedFile.name}`;
  const fileRef = storageRef(storage, fileName);
  
  await uploadBytes(fileRef, selectedFile);
  setUploadProgress(50);
  
  const downloadURL = await getDownloadURL(fileRef);
  setUploadProgress(70);
  
  // Store processed data in Realtime Database
  const database = getDatabase();
  const analysisRef = dbRef(database, 'analysis_data');
  const newAnalysisRef = push(analysisRef);
  
  await set(newAnalysisRef, {
    fileName: selectedFile.name,
    originalFileURL: downloadURL,
    uploadDate: timestamp,
    columnMappings,
    timestampConfig,
    rowCount: processedData.length,
    data: processedData,
    status: 'processed'
  });
  
  return true;
};