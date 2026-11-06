import { getFirestore, collection, doc, setDoc, writeBatch, deleteDoc, getDoc, getDocs } from 'firebase/firestore';

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
    temperature: ['temp', 'temperature', 'celsius', 'fahrenheit', 'temperat'],
    heartRate: ['heart', 'pulse', 'bpm', 'rate'],
    animalId: ['id', 'animal', 'tag', 'identifier', 'collar', 'collarseri']
  };
  
  // Check for date and time columns separately (only for timestamp config, not column mappings)
  const dateColumns = [];
  const timeColumns = [];
  const julianColumns = {
    year: null,
    julianDay: null,
    hour: null,
    minute: null
  };
  const timeComponentColumns = {
    hour: null,
    minute: null,
    second: null
  };

  // First pass: identify columns by name
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();

    // Check for date/time columns (for timestamp config only)
    if (lowerHeader.includes('date') && !lowerHeader.includes('time')) {
      dateColumns.push(header);
    } else if (lowerHeader.includes('time') && !lowerHeader.includes('date')) {
      timeColumns.push(header);
    }

    // Check for Julian day columns (for timestamp config only)
    if (lowerHeader.includes('year') && !julianColumns.year) {
      julianColumns.year = header;
    }
    if ((lowerHeader.includes('julian') || lowerHeader.includes('julianday')) && !julianColumns.julianDay) {
      julianColumns.julianDay = header;
    }
    if (lowerHeader === 'hour' && !julianColumns.hour) {
      julianColumns.hour = header;
    }
    if (lowerHeader === 'minute' && !julianColumns.minute) {
      julianColumns.minute = header;
    }

    // Check for separate time component columns (for timestamp config only)
    if (lowerHeader === 'hour' && !timeComponentColumns.hour) {
      timeComponentColumns.hour = header;
    }
    if (lowerHeader === 'minute' && !timeComponentColumns.minute) {
      timeComponentColumns.minute = header;
    }
    if (lowerHeader === 'second' && !timeComponentColumns.second) {
      timeComponentColumns.second = header;
    }

    // Try to match other columns (exclude timestamp-related columns from mapping)
    for (const columnType of Object.keys(mapping)) {
      if (!mapping[columnType] && columnType !== 'timestamp' && columnType !== 'dateColumn' && columnType !== 'timeColumn') {
        const detectedType = checkColumn(header, data, patterns);
        if (detectedType === columnType) {
          mapping[columnType] = header;
        }
      }
    }
  });
  
  // Configure timestamp approach based on detected columns
  // Check for Julian day format first
  if (julianColumns.year && julianColumns.julianDay && julianColumns.hour && julianColumns.minute) {
    timestampConf.format = 'julian';
    timestampConf.yearColumn = julianColumns.year;
    timestampConf.julianDayColumn = julianColumns.julianDay;
    timestampConf.hourColumn = julianColumns.hour;
    timestampConf.minuteColumn = julianColumns.minute;
  } else if (dateColumns.length > 0 && (timeComponentColumns.hour || timeComponentColumns.minute || timeComponentColumns.second)) {
    // Date + separate time components detected
    timestampConf.format = 'custom';
    timestampConf.dateColumn = dateColumns[0];
    timestampConf.hasDate = true;
    timestampConf.hasTime = true;
    timestampConf.hourColumn = timeComponentColumns.hour;
    timestampConf.minuteColumn = timeComponentColumns.minute;
    timestampConf.secondColumn = timeComponentColumns.second;
  } else if (dateColumns.length > 0 && timeColumns.length > 0) {
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
    if (!columnMappings.animalId) {
      errors.push('Animal ID column must be selected');
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
 * Parse various date/time formats and convert to ISO format (preserving local time)
 * @param {string} timestamp - Timestamp string to parse
 * @returns {string|null} ISO formatted timestamp (local time) or null if invalid
 */
function parseTimestamp(timestamp) {
  if (!timestamp) return null;

  // Handle DD/MM/YYYY HH:mm format (e.g., "19/12/2012 19:31")
  const dmyMatch = timestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (dmyMatch) {
    const [, day, month, year, hour, minute] = dmyMatch;
    // Return in ISO format but preserving local time (no timezone conversion)
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  // Handle DD-MM-YYYY HH:mm format
  const dmyDashMatch = timestamp.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (dmyDashMatch) {
    const [, day, month, year, hour, minute] = dmyDashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  // Handle YYYY-MM-DD HH:mm format
  const ymdMatch = timestamp.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (ymdMatch) {
    const [, year, month, day, hour, minute] = ymdMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  // Handle MM/DD/YYYY HH:mm format
  const mdyMatch = timestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (mdyMatch) {
    const [, month, day, year, hour, minute] = mdyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  // Handle MM/DD/YYYY format (date only)
  const mdyDateOnlyMatch = timestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyDateOnlyMatch) {
    const [, month, day, year] = mdyDateOnlyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`;
  }

  // Try to parse using Date constructor for other formats
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    // Format the date locally without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  return null;
}

/**
 * Parse Julian day format (Year + JulianDay + Hour + Minute)
 * @param {number} year - Year (e.g., 18 for 2018)
 * @param {number} julianDay - Julian day of year (1-366)
 * @param {number} hour - Hour (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {string|null} ISO formatted timestamp or null if invalid
 */
function parseJulianDay(year, julianDay, hour, minute) {
  if (!year || !julianDay || hour === undefined || minute === undefined) return null;

  // Handle 2-digit year (e.g., 18 -> 2018)
  const fullYear = year < 100 ? 2000 + year : year;

  // Create date from Julian day
  const date = new Date(fullYear, 0);
  date.setDate(julianDay);

  if (isNaN(date.getTime())) return null;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');

  return `${y}-${m}-${d}T${h}:${min}:00`;
}

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

    // Handle timestamp based on configuration (timestampConfig only, not columnMappings)
    if (timestampConfig.format === 'custom') {
      let dateStr = '';
      let timeStr = '';

      // Handle date
      if (timestampConfig.hasDate && timestampConfig.dateColumn) {
        const rawDate = row[timestampConfig.dateColumn] || timestampConfig.startDate;
        // Convert MM/DD/YYYY to YYYY-MM-DD format
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            // Assume MM/DD/YYYY format (US format)
            dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          } else {
            dateStr = rawDate;
          }
        } else if (rawDate.includes('-')) {
          dateStr = rawDate; // Already in YYYY-MM-DD format
        } else {
          dateStr = rawDate;
        }
      } else {
        dateStr = timestampConfig.startDate;
      }

      // Handle time - check for separate time components first
      if (timestampConfig.hasTime) {
        if (timestampConfig.hourColumn || timestampConfig.minuteColumn || timestampConfig.secondColumn) {
          // Build time from separate components - DIRECT COMBINATION, no parsing
          const hour = timestampConfig.hourColumn ? (row[timestampConfig.hourColumn] || '00') : '00';
          const minute = timestampConfig.minuteColumn ? (row[timestampConfig.minuteColumn] || '00') : '00';
          const second = timestampConfig.secondColumn ? (row[timestampConfig.secondColumn] || '00') : '00';
          timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
          // Directly combine - don't go through parseTimestamp
          processed._processedTimestamp = `${dateStr}T${timeStr}`;
        } else if (timestampConfig.timeColumn) {
          // Use single time column
          timeStr = row[timestampConfig.timeColumn] || timestampConfig.startTime;
          // Try to parse combined date and time
          if (timestampConfig.hasDate && timestampConfig.dateColumn && row[timestampConfig.dateColumn]) {
            const combined = `${row[timestampConfig.dateColumn]} ${timeStr}`;
            const parsed = parseTimestamp(combined);
            if (parsed) {
              processed._processedTimestamp = parsed;
            } else {
              processed._processedTimestamp = `${dateStr}T${timeStr}`;
            }
          } else {
            processed._processedTimestamp = `${dateStr}T${timeStr}`;
          }
        } else {
          // Use default time
          timeStr = timestampConfig.startTime;
          processed._processedTimestamp = `${dateStr}T${timeStr}`;
        }
      } else {
        timeStr = timestampConfig.startTime;
        processed._processedTimestamp = `${dateStr}T${timeStr}`;
      }
    } else if (timestampConfig.format === 'interval') {
      const startDateTime = new Date(`${timestampConfig.startDate}T${timestampConfig.startTime}`);
      const intervalMs = timestampConfig.interval * 60 * 1000;
      timestamp = new Date(startDateTime.getTime() + index * intervalMs);
      processed._processedTimestamp = isNaN(timestamp) ? 'Invalid date' : timestamp.toISOString();
    } else if (timestampConfig.format === 'julian') {
      // Handle Julian day format
      const year = row[timestampConfig.yearColumn];
      const julianDay = row[timestampConfig.julianDayColumn];
      const hour = row[timestampConfig.hourColumn];
      const minute = row[timestampConfig.minuteColumn];
      const parsed = parseJulianDay(year, julianDay, hour, minute);
      if (parsed) {
        processed._processedTimestamp = parsed;
      } else {
        processed._processedTimestamp = 'Invalid date';
      }
    } else {
      // Default: no timestamp configured
      processed._processedTimestamp = 'Invalid date';
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

/**
 * Process and upload data to Firestore
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

    // Sanitize keys
    const sanitized = renamedData.map(sanitizeKeys);

    // Get the animalId column name from column mappings
    const animalIdColumn = columnMappings.animalId || 'animalId';

    // Group data by animal ID
    const groupedByAnimal = {};
    sanitized.forEach(row => {
      const animalId = row[animalIdColumn] || 'unknown';
      if (!groupedByAnimal[animalId]) {
        groupedByAnimal[animalId] = [];
      }
      groupedByAnimal[animalId].push(row);
    });

    const db = getFirestore();
    const animalIds = Object.keys(groupedByAnimal);
    let totalProcessed = 0;
    const totalRows = sanitized.length;

    // Upload each animal's data separately
    for (const animalId of animalIds) {
      const animalData = groupedByAnimal[animalId];
      const currentAnimalDetails = animalDetails[animalId] || {};
      console.log(`Processing animal ID: ${animalId}`, currentAnimalDetails);

      // Species comes from Animal Details (step 5) only
      let animalSpecies = currentAnimalDetails.species;

      // Fallback if not set
      if (!animalSpecies) {
        animalSpecies = 'UnknownSpecies';
        console.warn(`No species found for animal ${animalId}. Using 'UnknownSpecies'. Please select a species in the Animal Details step.`);
      }

      const finalSpecies = animalSpecies.replace(/\s+/g, '_');
      const documentId = `${finalSpecies}_${animalId}`;
      console.log(`Document ID will be: ${documentId}`);

      // Add species to each data row
      const dataWithSpecies = animalData.map(row => ({
        ...row,
        species: animalSpecies // Use the actual species name with spaces
      }));

      // Create/update animal document
      await setDoc(
        doc(db, 'AnalysisData', documentId),
        {
          ...currentAnimalDetails,
          columnMappings,
          timestampConfig,
          dataPoints: animalData.length,
          uploadedAt: new Date().toISOString()
        },
        { merge: true }
      );

      // Upload data rows to Firestore
      await uploadRowsToFirestore(
        dataWithSpecies,
        documentId,
        animalId,
        {
          ...currentAnimalDetails,
          columnMappings,
          timestampConfig,
          dataPoints: animalData.length
        },
        (progress) => {
          // Calculate overall progress based on rows processed
          const overallProgress = Math.round(((totalProcessed + (progress / 100) * animalData.length) / totalRows) * 100);
          if (setUploadProgress) setUploadProgress(overallProgress);
        },
        null,
        null,
        100
      );

      totalProcessed += animalData.length;
    }

    setUploadProgress(100);

    return { success: true, animalIds };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Upload rows in batches to Firestore.
 * @param {Object[]} rows - Array of data rows to upload
 * @param {string} documentId - Document ID (used in path)
 * @param {string} animalId - Animal ID (used in path)
 * @param {Object} animalDetails - Animal details (unused, kept for backward compatibility)
 * @param {Function} setUploadProgress
 * @param {Function} setUploadStatus
 * @param {Function} setUploadMessage
 * @param {number} batchSize
 */
export const uploadRowsToFirestore = async (
  rows,
  documentId,
  animalId,
  animalDetails,
  setUploadProgress,
  setUploadStatus,
  setUploadMessage,
  batchSize = 100
) => {
  const db = getFirestore();
  const dataCol = collection(db, 'AnalysisData', documentId, 'data');
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

/**
 * Fetch all uploaded datasets from Firestore.
 * Returns an array of { species, animalId, ...animalDetails }
 */
export const fetchAllUploadedDatasets = async () => {
  const db = getFirestore();
  const result = [];

  try {
    // Get all documents under AnalysisData collection
    const analysisDataCol = collection(db, 'AnalysisData');
    const snapshot = await getDocs(analysisDataCol);

    for (const doc of snapshot.docs) {
      const documentId = doc.id;
      const animalDetails = doc.data();

      // Skip metadata documents
      if (documentId === '_metadata') continue;

      // Parse species and animalId from documentId (format: species_animalId)
      const parts = documentId.split('_');
      const species = parts.slice(0, -1).join('_') || 'UnknownSpecies';
      const animalId = parts[parts.length - 1];

      // Get data points count from the data subcollection
      let dataPoints = 0;
      try {
        const dataCol = collection(db, 'AnalysisData', documentId, 'data');
        const dataSnapshot = await getDocs(dataCol);
        dataPoints = dataSnapshot.size;
      } catch (e) {
        // If data subcollection doesn't exist or can't be accessed, use dataPoints from document
        dataPoints = animalDetails.dataPoints || 0;
      }

      result.push({
        species,
        animalId,
        documentId,
        ...animalDetails,
        dataPoints
      });
    }
  } catch (error) {
    console.error('Error fetching datasets:', error);
  }

  return result;
};

/**
 * Delete a dataset from Firestore.
 * @param {string} documentId
 */
export const deleteUploadedDataset = async (documentId) => {
  const db = getFirestore();
  // Remove from Firestore
  const animalDocRef = doc(db, 'AnalysisData', documentId);
  await deleteDoc(animalDocRef);

  // Note: Firestore doesn't support deleting subcollections directly.
  // This is a known limitation. For now, we'll delete the parent document
  // which should be sufficient for most use cases.
};