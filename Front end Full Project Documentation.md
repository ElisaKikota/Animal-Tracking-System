# Project Documentation


# Directory: src


## Directory: analysis


### File: App.css
```
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden; /* Prevents scrolling on the body */
}

.app-container {
  display: flex;
  transition: margin-left 0.3s;
  flex-direction: column;
  height: 100vh;
}

.sidebar-open .content-container {
  margin-left: 160px; /* Width of the sidebar */
}

.navbar {
  flex-shrink: 0; /* Prevents navbar from shrinking */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100; /* Highest z-index to stay on top */
}

.content-container {
  flex: 1;
  transition: margin-left 0.3s;
  margin-top: 64px; /* Adjust based on your navbar height */
  overflow: hidden;
  position: relative;
}

.content-container.shifted {
  margin-left: 200px; /* Should match the open width of your sidebar */
}

/* Fix for sidebar layering */
.sidebar {
  z-index: 1000; /* Below navbar but above most content */
}

/* Ensure pages fit properly */
.page-up-enter, .page-up-exit, 
.page-down-enter, .page-down-exit {
  position: absolute;
  width: 100%;
  height: calc(100vh - 64px);
  overflow: hidden;
}

/* Fix for historical page */
.historical-patterns-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
```


### File: App.js
```
import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Welcome from './pages/Welcome';
import RealTime from './pages/realtime/index';
import HistoricalPatterns from './pages/historical/HistoricalPatterns';
import ViewUsers from './pages/ViewUsers';
import ViewAnimals from './pages/ViewAnimals';
import Analysis from './pages/Analysis';
import ChangePassword from './pages/ChangePassword';
import './App.css';
import './styles/Transitions.css';

const pageOrder = [
  '/welcome',
  '/real_time',
  '/historical_patterns',
  '/view_users',
  '/view_animals',
  '/analysis',
  '/change_password',
  '/signout'
];

const AppContent = () => {
  const location = useLocation();
  const prevLocationRef = useRef(location);
  const [direction, setDirection] = useState('up');

  useEffect(() => {
    const prevIndex = pageOrder.indexOf(prevLocationRef.current.pathname);
    const currentIndex = pageOrder.indexOf(location.pathname);

    if (currentIndex > prevIndex) {
      setDirection('up');
    } else if (currentIndex < prevIndex) {
      setDirection('down');
    }

    prevLocationRef.current = location;
  }, [location]);

  // Update document title based on current route
  useEffect(() => {
    const path = location.pathname;
    let title = 'AI-Powered Animal Tracking System';
    
    switch(path) {
      case '/':
      case '/welcome':
        title = 'Welcome | Animal Tracking';
        break;
      case '/real_time':
        title = 'Real Time Tracking | Animal Tracking';
        break;
      case '/historical_patterns':
        title = 'Historical Patterns | Animal Tracking';
        break;
      case '/view_users':
        title = 'View Users | Animal Tracking';
        break;
      case '/view_animals':
        title = 'View Animals | Animal Tracking';
        break;
      case '/analysis':
        title = 'Analysis Data | Animal Tracking';
        break;
      case '/change_password':
        title = 'Change Password | Animal Tracking';
        break;
      case '/signout':
        title = 'Sign Out | Animal Tracking';
        break;
      default:
        title = 'AI-Powered Animal Tracking System';
    }
    
    document.title = title;
  }, [location]);

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        timeout={{ enter: 300, exit: 300 }}
        classNames={`page-${direction}`}
      >
        <Routes location={location}>
          <Route path="/" element={<Welcome />} />
          <Route path="/real_time" element={<RealTime />} />
          <Route path="/historical_patterns" element={<HistoricalPatterns />} />
          <Route path="/view_users" element={<ViewUsers />} />
          <Route path="/view_animals" element={<ViewAnimals />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/change_password" element={<ChangePassword />} />
          <Route path="/signout" element={<div>Signout Page</div>} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className="content-container">
          <AppContent />
        </div>
      </div>
    </Router>
  );
}

export default App;
```


### File: App.test.js
```
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

```


## Directory: assets


## Directory: assets\old


## Directory: assets\screenshots


## Directory: components


## Directory: components\analysis


### File: components\Navbar.css
```
/* Navbar styling */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: var(--navbar-sidebar-color);
    color: white;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1001;
  }
  
  .navbar .menu-icon {
    cursor: pointer;
  }
  
  .navbar .logo img {
    height: 40px; /* Adjust based on your logo size */
  }
  
  .navbar .nav-icons {
    display: flex;
    align-items: center;
  }
  
  .navbar .nav-icons img {
    height: 30px; /* Adjust based on your icon size */
    margin-left: 20px;
  }
  
```


### File: components\Navbar.js
```
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logo from '../assets/logo.png'; // Ensure this path points to your logo

const navbarColor = '#3f51b'; // Define your common color
// Greened const navbarColor = '#3f501b'; // Define your common color

function Navbar({ toggleSidebar }) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: navbarColor }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
        <img src={Logo} alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          AI-Powered Animal Tracking System
        </Typography>
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

```


### File: components\Sidebar.css
```
.sidebar {
  position: fixed;
  top: 60px; /* Adjust based on your navbar height */
  left: 0;
  height: calc(100vh - 60px);
  background-color: rgb(31, 118, 206);
  transition: width 0.3s ease;
  overflow: hidden;
  width: 60px; /* Width when closed */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar.open {
  width: 220px; /* Width when open */
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: rgba(255, 255, 255, 0.7); /* Slightly dimmed for non-active links */
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar a:hover {
  background-color: #157ee7;
  color: white;
}

/* Active link styling */
.sidebar a.active {
  background-color: #157ee7;
  color: white;
  font-weight: 500;
  border-left: 3px solid white;
}

.sidebar a.active svg {
  color: white;
}

.sidebar a.active span {
  color: white;
}

.sidebar svg {
  min-width: 24px;
  margin-right: 15px;
}

.sidebar span {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.open span {
  opacity: 1;
}
```


### File: components\Sidebar.js
```
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, Users, PawPrint, Database, Lock, LogOut, History } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isSidebarOpen, setCurrentPage }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: '/', text: 'Welcome', icon: Home },
    { path: '/real_time', text: 'Real Time', icon: Clock },
    { path: '/historical_patterns', text: 'Historical Patterns', icon: History },
    { path: '/view_users', text: 'View Users', icon: Users },
    { path: '/view_animals', text: 'View Animals', icon: PawPrint },
    { path: '/analysis', text: 'Analysis Data', icon: Database },
    { path: '/change_password', text: 'Change Password', icon: Lock },
    { path: '/signout', text: 'Signout', icon: LogOut },
  ];

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <ul>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path || 
            (currentPath === '' && item.path === '/');
          
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={() => setCurrentPage && setCurrentPage(item.path)}
                className={isActive ? 'active' : ''}
              >
                <item.icon size={24} />
                <span>{item.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
```


## Directory: config


## Directory: context


### File: firebase.js
```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtNxcTTljrMmTx3W_Srv0Na0sBeCUDkxI",
  authDomain: "animal-tracking-01.firebaseapp.com",
  projectId: "animal-tracking-01",
  storageBucket: "animal-tracking-01.appspot.com",
  messagingSenderId: "29693013811",
  appId: "1:29693013811:web:2cfc9743a521185aba5846",
  measurementId: "G-7MQ80W5KXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
```


### File: index.css
```
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
    }

```


### File: index.js
```
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

```


## Directory: pages


### File: pages\Analysis.js
```
import React from 'react';
import { Box } from '@mui/material';
import AnalysisDataPage from './AnalysisDataPage';

function Analysis() {
  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)', // Subtract navbar height
        overflowY: 'auto',           // Make it scrollable
        px: 2,                       // Add horizontal padding
        py: 3                        // Add vertical padding
      }}
    >
      <AnalysisDataPage />
    </Box>
  );
}

export default Analysis;
```


### File: pages\AnalysisDataPage.jsx
```
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
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set } from 'firebase/database';
import { database } from '../firebase';

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
  generatePreviewData, 
  processAndUploadData 
} from './utils/dataProcessingUtils';

const AnalysisDataPage = () => {
  // File and data states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
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
    <Container maxWidth="lg">
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
```


### File: pages\AnalysisInput.js
```
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
```


### File: pages\ChangePassword.js
```
import React from 'react';

function ChangePassword() {
  return <div>Change Password Page</div>;
}

export default ChangePassword;

```


### File: pages\chartConfig.js
```
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default ChartJS;
```


## Directory: pages\historical


### File: pages\historical\AnimalSelector.jsx
```
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { PawPrint } from 'lucide-react';

const AnimalSelector = ({ animals, selectedAnimals, onAnimalSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === '' || animal.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const speciesList = [...new Set(animals.map(animal => animal.species))];

  const handleSpeciesChange = (event) => {
    setSelectedSpecies(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAnimalChange = (event) => {
    const value = event.target.value;
    onAnimalSelection(value);
  };

  const getAnimalName = (id) => {
    const animal = animals.find(a => a.id === id);
    return animal ? animal.name : id;
  };

  return (
    <Box className="animal-selector">
      <Typography variant="h6" className="section-title">
        <PawPrint size={20} />
        Select Animals to Track
      </Typography>
      
      <Box className="filter-controls">
        <FormControl className="species-filter" sx={{ minWidth: 120 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={selectedSpecies}
            onChange={handleSpeciesChange}
            label="Species"
          >
            <MenuItem value="">All Species</MenuItem>
            {speciesList.map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl className="search-filter" sx={{ flex: 1 }}>
          <InputLabel>Search Animals</InputLabel>
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearchChange}
            label="Search Animals"
          />
        </FormControl>
      </Box>
      
      <FormControl className="animal-multi-select" sx={{ width: '100%', mt: 2 }}>
        <InputLabel>Select Animals</InputLabel>
        <Select
          multiple
          value={selectedAnimals}
          onChange={handleAnimalChange}
          input={<OutlinedInput label="Select Animals" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={getAnimalName(value)} />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5,
                width: 250,
              },
            },
          }}
        >
          {filteredAnimals.map((animal) => (
            <MenuItem key={animal.id} value={animal.id}>
              <Checkbox checked={selectedAnimals.indexOf(animal.id) > -1} />
              <ListItemText 
                primary={animal.name} 
                secondary={`${animal.species}, ${animal.sex}, ${animal.age} years`} 
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default AnimalSelector;
```


### File: pages\historical\DateRangeSelector.jsx
```
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
```


### File: pages\historical\HistoricalPatterns.css
```
.historical-patterns-container {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100vh - 64px);
  margin-top: 0;
  overflow: hidden;
  background-color: white;
}

/* Remove fixed margins and use absolute positioning relative to sidebar width */
.historical-map {
  position: absolute;
  top: 0;
  left: 60px; /* width of historical sidebar */
  right: 0;
  bottom: 0;
  height: 100%;
  width: auto;
  z-index: 0;
  background-color: white;
  transition: left 0.3s;
}

.sidebar-open .historical-map {
  left: 60px; /* Keep the same regardless of main sidebar state */
}

.historical-sidebar {
  position: absolute;
  top: 0;
  left: 60px; /* Position after collapsed main sidebar */
  height: 100%;
  width: 70px;
  background-color: rgba(31, 118, 206, 0.6);
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 900;
  transition: left 0.3s;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
}

/* Adjust when main sidebar is open */
.sidebar-open .historical-sidebar {
  left: 60px; /* Match your main sidebar's open width */
}

.historical-sidebar .sidebar-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 8px 0;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.historical-sidebar .sidebar-button:hover {
  background-color: rgba(21, 126, 231, 0.5);
  color: white;
}

.historical-sidebar .sidebar-button.active {
  background-color: rgba(21, 126, 231, 0.7);
  color: white;
  border-left: 3px solid white;
}

.historical-sidebar .sidebar-button span {
  font-size: 12px;
  margin-top: 5px;
  display: none;
}

.controls-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 350px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 15px;
  z-index: 950;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.controls-panel h2 {
  color: #1F76CE;
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

/* Fix for leaflet container to fill available space */
.historical-patterns-container .leaflet-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
}

/* Fix for when no background appears */
.leaflet-container {
  background-color: #f8f8f8 !important;
}

.section-title {
  display: flex !important;
  align-items: center !important;
  gap: 8px;
  color: #1F76CE !important;
  font-size: 16px !important;
  margin-bottom: 12px !important;
}

/* Date Range Selector */
.date-range-selector {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.date-inputs {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.date-input {
  flex: 1;
}

/* Animal Selector */
.animal-selector {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.filter-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.species-filter {
  width: 120px;
}

.search-filter {
  flex: 1;
}

/* Timeline Control */
.timeline-control {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.current-time {
  margin: 10px 0;
  text-align: center;
  font-weight: 500;
}

.timeline-slider {
  margin: 15px 0;
  padding: 0 10px;
}

.playback-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 10px 0;
}

.speed-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.speed-controls .MuiButtonGroup-root {
  margin-top: 8px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .historical-sidebar,
  .sidebar-open .historical-sidebar {
    left: 0;
  }
  
  .historical-map {
    left: 70px;
  }
  
  .controls-panel {
    width: calc(100% - 90px);
  }
}
```


### File: pages\historical\HistoricalPatterns.jsx
```
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon } from 'leaflet';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import Sidebar from './Sidebar';
import DateRangeSelector from './DateRangeSelector';
import AnimalSelector from './AnimalSelector';
import TimelineControl from './TimelineControl';
import './HistoricalPatterns.css';

// Import animal icons
import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';

// Map component that safely adjusts to sidebar changes
const ResponsiveMap = ({ children, isMainSidebarOpen }) => {
  const map = useMap();
  const isMapReady = useRef(false);
  
  // First, establish that the map is ready
  useEffect(() => {
    if (map && map._loaded && !isMapReady.current) {
      isMapReady.current = true;
    }
  }, [map]);
  
  // Then handle resize events safely
  useEffect(() => {
    if (isMapReady.current) {
      try {
        // Delay to allow transitions to complete
        const timer = setTimeout(() => {
          if (map && map._container && document.body.contains(map._container)) {
            map.invalidateSize({ animate: false });
          }
        }, 500);
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.warn('Map resize error:', err);
      }
    }
  }, [isMainSidebarOpen, map]);
  
  return <>{children}</>;
};

const HistoricalPatterns = () => {
  const [animalData, setAnimalData] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    endDate: new Date()
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [pathData, setPathData] = useState([]);
  const [mapKey, setMapKey] = useState('initial');
  const [mapReady, setMapReady] = useState(false);
  
  // Get main sidebar state from App's CSS classes
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Monitor main sidebar state changes
  useEffect(() => {
    const checkMainSidebar = () => {
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        const isOpen = appContainer.classList.contains('sidebar-open');
        if (isMainSidebarOpen !== isOpen) {
          setIsMainSidebarOpen(isOpen);
          // Only change map key if map is ready
          if (mapReady) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
              setMapKey(`map-${Date.now()}`);
            }, 100);
          }
        }
      }
    };
    
    // Check initial state
    checkMainSidebar();
    
    // Create a mutation observer to watch for class changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          checkMainSidebar();
        }
      });
    });
    
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      observer.observe(appContainer, { attributes: true });
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isMainSidebarOpen, mapReady]);

  // Load all animal data
  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = [];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.entries(data).forEach(([id, animal]) => {
            const animalObj = {
              id,
              species: species.slice(0, -1),
              name: animal.name,
              sex: animal.sex,
              age: animal.age,
              locationHistory: []
            };

            // Process location history
            if (animal.location) {
              Object.entries(animal.location).forEach(([date, times]) => {
                Object.entries(times).forEach(([time, location]) => {
                  const timestamp = new Date(`${date} ${time}`).getTime();
                  animalObj.locationHistory.push({
                    timestamp,
                    date,
                    time,
                    lat: parseFloat(location.Lat),
                    lng: parseFloat(location.Long),
                    temperature: location.temperature || 'N/A',
                    activity: location.activity || 'N/A'
                  });
                });
              });
              
              // Sort location history by timestamp
              animalObj.locationHistory.sort((a, b) => a.timestamp - b.timestamp);
            }

            fetchedData.push(animalObj);
          });
        }
      });
    });

    setAnimalData(fetchedData);
  }, []);

  // Update path data when selected animals or date range changes
  useEffect(() => {
    if (selectedAnimals.length === 0) return;

    const newPathData = [];
    const startTimestamp = dateRange.startDate.getTime();
    const endTimestamp = dateRange.endDate.getTime();

    selectedAnimals.forEach(animalId => {
      const animal = animalData.find(a => a.id === animalId);
      if (!animal) return;

      const filteredLocations = animal.locationHistory.filter(
        loc => loc.timestamp >= startTimestamp && loc.timestamp <= endTimestamp
      );

      if (filteredLocations.length > 0) {
        newPathData.push({
          id: animal.id,
          name: animal.name,
          species: animal.species,
          path: filteredLocations.map(loc => [loc.lat, loc.lng]),
          locations: filteredLocations,
          color: getPathColor(animal.species)
        });
      }
    });

    setPathData(newPathData);
    
    // Set current timestamp to the earliest one in the range if not set
    if (!currentTimestamp && newPathData.length > 0) {
      const allTimestamps = newPathData.flatMap(animal => 
        animal.locations.map(loc => loc.timestamp)
      );
      if (allTimestamps.length > 0) {
        setCurrentTimestamp(Math.min(...allTimestamps));
      }
    }
  }, [selectedAnimals, animalData, dateRange, currentTimestamp]);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleAnimalSelection = (selectedIds) => {
    setSelectedAnimals(selectedIds);
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    setCurrentTimestamp(null); // Reset timestamp when date range changes
  };

  const handleTimelineChange = (timestamp) => {
    setCurrentTimestamp(timestamp);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const getAnimalIcon = (species) => {
    const iconUrl = 
      species.toLowerCase() === 'elephant' ? elephantIcon :
      species.toLowerCase() === 'lion' ? lionIcon :
      species.toLowerCase() === 'giraffe' ? giraffeIcon :
      species.toLowerCase() === 'rhino' ? rhinoIcon :
      species.toLowerCase() === 'leopard' ? leopardIcon :
      elephantIcon; // Default

    return new Icon({
      iconUrl,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
  };

  const getPathColor = (species) => {
    switch(species.toLowerCase()) {
      case 'elephant': return '#4a7c59';
      case 'lion': return '#f39237';
      case 'giraffe': return '#d63230';
      case 'rhino': return '#5b85aa';
      case 'leopard': return '#8b5fbf';
      default: return '#3f88c5';
    }
  };

  // Get current positions based on the timeline
  const getCurrentPositions = () => {
    if (!currentTimestamp) return [];
    
    return pathData.map(animal => {
      // Find the location closest to current timestamp (before or equal)
      const locationsBeforeTimestamp = animal.locations.filter(
        loc => loc.timestamp <= currentTimestamp
      );
      
      if (locationsBeforeTimestamp.length === 0) return null;
      
      const currentLocation = locationsBeforeTimestamp[locationsBeforeTimestamp.length - 1];
      return {
        id: animal.id,
        name: animal.name,
        species: animal.species,
        position: [currentLocation.lat, currentLocation.lng],
        timestamp: currentLocation.timestamp,
        temperature: currentLocation.temperature,
        activity: currentLocation.activity
      };
    }).filter(position => position !== null);
  };

  const currentPositions = getCurrentPositions();
  
  // Safely handle map loading
  const handleMapLoad = () => {
    setMapReady(true);
  };

  return (
    <div 
      className={isMainSidebarOpen ? 'historical-patterns-container sidebar-open' : 'historical-patterns-container'} 
      ref={containerRef}
    >
      <Sidebar 
        onMenuSelect={toggleMenu} 
        activeMenu={activeMenu}
        isMainSidebarOpen={isMainSidebarOpen}
      />
      
      <div className="controls-panel">
        <h2>Historical Movement Patterns</h2>
        <DateRangeSelector 
          startDate={dateRange.startDate} 
          endDate={dateRange.endDate}
          onDateRangeChange={handleDateRangeChange}
        />
        <AnimalSelector 
          animals={animalData}
          selectedAnimals={selectedAnimals}
          onAnimalSelection={handleAnimalSelection}
        />
        {pathData.length > 0 && (
          <TimelineControl
            paths={pathData}
            currentTime={currentTimestamp}
            onTimeChange={handleTimelineChange}
            isPlaying={isPlaying}
            onPlayToggle={togglePlayback}
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
          />
        )}
      </div>

      <div className="historical-map">
        <MapContainer 
          className="leaflet-container"
          center={[-1.948, 34.1665]} 
          zoom={13} 
          zoomControl={false}
          key={mapKey}
          style={{ width: '100%', height: '100%' }}
          whenReady={handleMapLoad}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {mapReady && isMainSidebarOpen !== undefined && (
            <ResponsiveMap isMainSidebarOpen={isMainSidebarOpen}>
              {/* Draw paths for selected animals */}
              {pathData.map(animal => (
                <Polyline
                  key={animal.id}
                  positions={animal.path}
                  color={animal.color}
                  weight={3}
                  opacity={0.7}
                  dashArray={animal.species === 'Elephant' ? '': '5, 5'}
                />
              ))}
              
              {/* Mark current positions */}
              <MarkerClusterGroup>
                {currentPositions.map(animal => (
                  <Marker
                    key={animal.id}
                    position={animal.position}
                    icon={getAnimalIcon(animal.species)}
                  >
                    <Popup>
                      <div>
                        <strong>{animal.name}</strong><br />
                        Species: {animal.species}<br />
                        Date: {new Date(animal.timestamp).toLocaleDateString()}<br />
                        Time: {new Date(animal.timestamp).toLocaleTimeString()}<br />
                        Temperature: {animal.temperature}°C<br />
                        Activity: {animal.activity}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </ResponsiveMap>
          )}

          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>
    </div>
  );
};

export default HistoricalPatterns;
```


### File: pages\historical\Sidebar.jsx
```
import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { Map, Filter, Settings, Download, Share } from 'lucide-react';

const Sidebar = ({ onMenuSelect, activeMenu, isMainSidebarOpen }) => {
  const menuItems = [
    { id: 'layers', icon: Map, label: 'Map Layers' },
    { id: 'filters', icon: Filter, label: 'Advanced Filters' },
    { id: 'settings', icon: Settings, label: 'Display Settings' },
    { id: 'export', icon: Download, label: 'Export Data' },
    { id: 'share', icon: Share, label: 'Share Analysis' }
  ];

  return (
    <Box className={`historical-sidebar ${isMainSidebarOpen ? 'main-sidebar-open' : ''}`}>
      {menuItems.map(item => (
        <Tooltip
          key={item.id}
          title={item.label}
          placement="right"
        >
          <button 
            className={`sidebar-button ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuSelect(item.id)}
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </button>
        </Tooltip>
      ))}
    </Box>
  );
};

export default Sidebar;
```


### File: pages\historical\TimelineControl.jsx
```
import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  IconButton, 
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { Play, Pause, FastForward, Rewind, Clock } from 'lucide-react';

const TimelineControl = ({ 
  paths, 
  currentTime, 
  onTimeChange, 
  isPlaying, 
  onPlayToggle, 
  playbackSpeed,
  onSpeedChange
}) => {
  const playInterval = useRef(null);
  
  // Find the full range of timestamps across all paths
  const allTimestamps = paths.flatMap(animal => 
    animal.locations.map(loc => loc.timestamp)
  );
  
  const minTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : 0;
  const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : 0;
  
  // Format the date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No data';
    return new Date(timestamp).toLocaleString();
  };

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        onTimeChange(prevTime => {
          const nextTime = prevTime + (60000 * playbackSpeed); // Advance by minutes × speed
          if (nextTime > maxTime) {
            // Loop back to beginning when we reach the end
            return minTime;
          }
          return nextTime;
        });
      }, 1000); // Update every second
    } else if (playInterval.current) {
      clearInterval(playInterval.current);
    }
    
    return () => {
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
    };
  }, [isPlaying, playbackSpeed, maxTime, minTime, onTimeChange]);

  const handleSliderChange = (event, newValue) => {
    onTimeChange(newValue);
  };

  const handleSpeedButtonClick = (speed) => {
    onSpeedChange(speed);
  };

  return (
    <Box className="timeline-control">
      <Typography variant="h6" className="section-title">
        <Clock size={20} />
        Timeline Control
      </Typography>
      
      <Box className="current-time">
        <Typography variant="body1">
          Current Time: {formatDate(currentTime)}
        </Typography>
      </Box>
      
      <Box className="timeline-slider">
        <Slider
          value={currentTime || minTime}
          min={minTime}
          max={maxTime}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDate}
        />
      </Box>
      
      <Box className="playback-controls">
        <IconButton 
          onClick={() => onTimeChange(minTime)}
          disabled={currentTime === minTime}
        >
          <Rewind />
        </IconButton>
        
        <IconButton onClick={onPlayToggle}>
          {isPlaying ? <Pause /> : <Play />}
        </IconButton>
        
        <IconButton 
          onClick={() => onTimeChange(maxTime)}
          disabled={currentTime === maxTime}
        >
          <FastForward />
        </IconButton>
      </Box>
      
      <Box className="speed-controls">
        <Typography variant="body2">Playback Speed:</Typography>
        <ButtonGroup variant="outlined" size="small">
          <Tooltip title="Slow (1x)">
            <IconButton 
              color={playbackSpeed === 1 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(1)}
            >
              1x
            </IconButton>
          </Tooltip>
          <Tooltip title="Normal (5x)">
            <IconButton 
              color={playbackSpeed === 5 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(5)}
            >
              5x
            </IconButton>
          </Tooltip>
          <Tooltip title="Fast (15x)">
            <IconButton 
              color={playbackSpeed === 15 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(15)}
            >
              15x
            </IconButton>
          </Tooltip>
          <Tooltip title="Very Fast (60x)">
            <IconButton 
              color={playbackSpeed === 60 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(60)}
            >
              60x
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default TimelineControl;
```


### File: pages\PieChart.js
```
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
    maintainAspectRatio: false
  };

  return (
    <>
      <Typography variant="h6">Species Distribution</Typography>
      <Pie ref={chartRef} data={chartData} options={options} />
    </>
  );
}

export default PieChart;
```


## Directory: pages\realtime


### File: pages\realtime\index.js
```
import React, { useState } from 'react';
import Map from './Map';
import Sidebar from './Sidebar';
import LocationToggle from './LocationToggle';
import LayerMenu  from './menus/LayerMenu';
import ReportMenu from './menus/ReportMenu';
import PatrolMenu from './menus/PatrolMenu';
import AnimalMenu from './menus/AnimalMenu';
import RemoteControlMenu from './menus/RemoteControlMenu';
import ReportModal from './modals/ReportModals';
import '../../styles/RealTime.css';

const RealTime = () => {
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState('default');

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleAnimalLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleLayerChange = (style) => {
    setMapStyle(style);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  return (
    <div className="realtime-container">
      <Sidebar 
        onMenuSelect={toggleMenu} 
        activeMenu={activeMenu}
      />
      
      <LocationToggle 
        isRealTimeMode={isRealTimeMode}
        onToggle={() => setIsRealTimeMode(!isRealTimeMode)}
      />

      <Map 
        isRealTimeMode={isRealTimeMode} 
        selectedAnimalLocation={selectedLocation}
        mapStyle={mapStyle}
      />
      
      {activeMenu === 'layers' && (
        <LayerMenu onLayerChange={handleLayerChange} />
      )}
      
      {activeMenu === 'reports' && (
        <ReportMenu onReportSelect={handleReportSelect} />
      )}
      
      {activeMenu === 'patrols' && (
        <PatrolMenu />
      )}
      
      {activeMenu === 'animals' && (
        <AnimalMenu onAnimalLocationSelect={handleAnimalLocationSelect} />
      )}
      
      {activeMenu === 'remoteControl' && (
        <RemoteControlMenu />
      )}
      
      {selectedReport && (
        <ReportModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};

export default RealTime;
```


### File: pages\realtime\LocationToggle.css
```
.location-toggle-container {
    position: fixed;
    top: 74px; /* Positioned below navbar */
    right: 20px;
    z-index: 1000;
    background-color: white;
    padding: 8px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
  }
  
  .location-toggle-container:hover {
    background-color: #f5f5f5;
  }  
```


### File: pages\realtime\LocationToggle.js
```
// LocationToggle.js
import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import './LocationToggle.css';

const LocationToggle = ({ isRealTimeMode, onToggle }) => {
  return (
    <div className="location-toggle-container">
      <FormControlLabel
        control={
          <Switch
            checked={isRealTimeMode}
            onChange={onToggle}
            color="primary"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#1F76CE',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#1F76CE',
              },
            }}
          />
        }
        label={isRealTimeMode ? "Real-Time Tracking" : "Last Known Location"}
        labelPlacement="start"
        sx={{
          margin: 0,
          '& .MuiTypography-root': {
            fontWeight: 500,
            marginRight: 1
          }
        }}
      />
    </div>
  );
};

export default LocationToggle;

// LocationToggle.css

```


### File: pages\realtime\Map.css
```

.cluster-icon {
    background: rgba(31, 118, 206, 0.9);
    width: 40px !important;
    height: 40px !important;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.8);
  }
  
  .custom-marker-cluster {
    background: none;
    border: none;
  }
  
  .leaflet-marker-icon {
    transition: all 0.3s ease;
  }
  
  .map {
    width: 100%;
    height: 100%;
    z-index: 0;
  }
```


### File: pages\realtime\Map.js
```

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import { getAnimalIcon } from './utils/icons';
import { divIcon } from 'leaflet';
import './Map.css';

// Custom cluster icon creation
const createClusterCustomIcon = (cluster) => {
  return divIcon({
    html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
    className: 'custom-marker-cluster',
    iconSize: [40, 40]
  });
};

// MapController component for handling location changes
const MapController = ({ selectedLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.Lat, selectedLocation.Lng],
        17, // Slightly reduced zoom level for better context
        {
          duration: 2, // Increased duration for smoother animation
          easeLinearity: 0.25 // Reduced for smoother acceleration/deceleration
        }
      );
    }
  }, [selectedLocation, map]);

  return null;
};

const Map = ({ isRealTimeMode, selectedAnimalLocation }) => {
  const [animalData, setAnimalData] = useState([]);

  useEffect(() => {
    const fetchAndProcessAnimalData = () => {
      const speciesList = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
      const processedData = [];

      speciesList.forEach(species => {
        const speciesRef = ref(database, `Animals/${species}`);
        onValue(speciesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.entries(data).forEach(([id, animal]) => {
              if (animal.location) {
                const latestDate = Object.keys(animal.location).sort().pop();
                const latestTime = Object.keys(animal.location[latestDate]).sort().pop();
                const location = animal.location[latestDate][latestTime];

                const locationTimestamp = new Date(`${latestDate} ${latestTime}`).getTime();
                const oneHourAgo = Date.now() - (60 * 60 * 1000);

                if (!isRealTimeMode || (isRealTimeMode && locationTimestamp > oneHourAgo)) {
                  processedData.push({
                    id,
                    species: species.slice(0, -1),
                    name: animal.name,
                    sex: animal.sex,
                    age: animal.age,
                    location: {
                      Lat: parseFloat(location.Lat),
                      Lng: parseFloat(location.Long)
                    },
                    temp: location.temperature || 'N/A',
                    activity: location.activity || 'N/A',
                    timestamp: locationTimestamp,
                    date: latestDate,
                    time: latestTime
                  });
                }
              }
            });
            setAnimalData([...processedData]);
          }
        });
      });
    };

    fetchAndProcessAnimalData();
  }, [isRealTimeMode]);

  return (
    <MapContainer 
      className="map" 
      center={[-1.948, 34.1665]} 
      zoom={16} 
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <MapController selectedLocation={selectedAnimalLocation} />
      
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        iconCreateFunction={createClusterCustomIcon}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
      >
        {animalData.map(animal => (
          <Marker
            key={animal.id}
            position={[animal.location.Lat, animal.location.Lng]}
            icon={getAnimalIcon(animal.species)}
          >
            <Popup>
              <div style={{ padding: '5px' }}>
                <strong>{animal.name}</strong><br />
                Species: {animal.species}<br />
                Sex: {animal.sex}<br />
                Age: {animal.age} years<br />
                Temperature: {animal.temp}°C<br />
                Activity: {animal.activity}<br />
                {isRealTimeMode ? (
                  <div style={{ color: 'green' }}>
                    Live Update: {new Date(animal.timestamp).toLocaleTimeString()}
                  </div>
                ) : (
                  <div>
                    Last Update: {new Date(animal.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
```


## Directory: pages\realtime\menus


### File: pages\realtime\menus\AnimalMenu.js
```
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import locationIcon from '../../../assets/location.png';
import elephantIcon from '../../../assets/elephant.png';
import lionIcon from '../../../assets/lion.png';
import giraffeIcon from '../../../assets/giraffe.png';
import rhinoIcon from '../../../assets/rhino.png';
import leopardIcon from '../../../assets/leopard.png';

const AnimalMenu = ({ onAnimalLocationSelect }) => {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const getSpeciesIcon = (species) => {
    const speciesLower = species.toLowerCase();
    if (speciesLower.includes('elephant')) return elephantIcon;
    if (speciesLower.includes('lion')) return lionIcon;
    if (speciesLower.includes('giraffe')) return giraffeIcon;
    if (speciesLower.includes('rhino')) return rhinoIcon;
    if (speciesLower.includes('leopard')) return leopardIcon;
    return elephantIcon;
  };

  useEffect(() => {
    const fetchAnimalData = async () => {
      const speciesList = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
      const animalData = [];

      speciesList.forEach(species => {
        const speciesRef = ref(database, `Animals/${species}`);
        onValue(speciesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.entries(data).forEach(([id, animal]) => {
              const latestDate = Object.keys(animal.location || {}).sort().pop();
              const latestTime = latestDate ? Object.keys(animal.location[latestDate]).sort().pop() : null;
              
              if (latestDate && latestTime) {
                const location = animal.location[latestDate][latestTime];
                animalData.push({
                  id,
                  species,
                  icon: getSpeciesIcon(species),
                  name: animal.name,
                  date: latestDate,
                  time: latestTime,
                  location: {
                    Lat: parseFloat(location.Lat),
                    Lng: parseFloat(location.Long)
                  }
                });
              }
            });
            setAnimals([...animalData]);
          }
        });
      });
    };

    fetchAnimalData();
  }, []);

  const handleLocationClick = (animal) => {
    onAnimalLocationSelect(animal.location);
  };

  const filteredAnimals = animals.filter(animal =>
    animal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animal-menu show">
      <div className="animal-header">
        <span className="plus-sign">+</span>
        <span className="animal-title">Animals</span>
        <span className="close-sign">×</span>
      </div>
      <div className="animal-filters">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="animal-summary">
        <span>{filteredAnimals.length} results</span>
      </div>
      <div className="animal-list">
        {filteredAnimals.map((animal) => (
          <div key={animal.id} className="animal-item">
            <img
              src={animal.icon}
              alt={animal.species}
              className="animal-image"
            />
            <span className="entry-number">{animal.id}</span>
            <span className="animal-name">{animal.name}</span>
            <span className="animal-day-time">
              <div>{animal.date}</div>
              <div>{animal.time}</div>
            </span>
            <button 
              className="locate-icon"
              onClick={() => handleLocationClick(animal)}
            >
              <img src={locationIcon} alt="Locate" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalMenu;
```


### File: pages\realtime\menus\index.js
```
export { default as LayerMenu } from './LayerMenu';
export { default as ReportMenu } from './ReportMenu';
export { default as PatrolMenu } from './PatrolMenu';
export { default as AnimalMenu } from './AnimalMenu';
export { default as RemoteControlMenu } from './RemoteControlMenu';
```


### File: pages\realtime\menus\LayerMenu.js
```
import React from 'react';
import outdoorsIcon from '../../../assets/outdoors.png';
import lightIcon from '../../../assets/light.png';
import darkIcon from '../../../assets/dark.png';
import satelliteIcon from '../../../assets/satellite.png';
import threeDIcon from '../../../assets/3d.png';
import heatmapIcon from '../../../assets/heatmap.png';

const LayerMenu = ({ onLayerChange }) => {
  const layers = [
    { id: 'outdoors', style: 'mapbox/outdoors-v11', icon: outdoorsIcon, label: 'Outdoors' },
    { id: 'light', style: 'mapbox/light-v10', icon: lightIcon, label: 'Light' },
    { id: 'dark', style: 'mapbox/dark-v10', icon: darkIcon, label: 'Dark' },
    { id: 'satellite', style: 'mapbox/satellite-v9', icon: satelliteIcon, label: 'Satellite' },
    { id: '3d', style: 'elisakikota/clzjmuy7i00jx01r37jx58xy9', icon: threeDIcon, label: '3D' },
    { id: 'heatmap', style: 'mapbox/heatmap-v10', icon: heatmapIcon, label: 'Heatmap' }
  ];

  return (
    <div className="layer-menu show">
      {layers.map(layer => (
        <button 
          key={layer.id}
          className="btn" 
          onClick={() => onLayerChange(layer.style)}
        >
          <img src={layer.icon} alt={layer.label} className="layer-icon" />
          {layer.label}
        </button>
      ))}
    </div>
  );
};

export default LayerMenu;
```


### File: pages\realtime\menus\PatrolMenu.js
```
import React from 'react';
import patrolsIcon from '../../../assets/patrols.png';
import locationIcon from '../../../assets/location.png';

const PatrolMenu = () => {
  return (
    <div className="patrol-menu show">
      <div className="patrol-header">
        <span className="plus-sign">+</span>
        <span className="patrol-title">Patrol Officers</span>
        <span className="close-sign">×</span>
      </div>
      <div className="patrol-filters">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="patrol-list">
        <div className="patrol-item">
          <img src={patrolsIcon} alt="patrol" className="patrol-image" />
          <span className="entry-number">1</span>
          <span className="patrol-name">Elisa Kikota</span>
          <span className="patrol-day-time">
            <div>9th Aug 2024</div>
            <div>12:30 PM</div>
          </span>
          <button className="locate-icon">
            <img src={locationIcon} alt="Locate" className="layer-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatrolMenu;

```


### File: pages\realtime\menus\RemoteControlMenu.js
```
import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../../firebase';
import { getAnimalIcon } from '../utils/icons';
import locationIcon from '../../../assets/location.png';

const RemoteControlMenu = () => {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const animalsRef = ref(database, 'Animals');
    return onValue(animalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedAnimals = Object.entries(data).flatMap(([species, animals]) =>
          Object.entries(animals).map(([id, animal]) => ({
            id,
            species,
            ...animal
          }))
        );
        setAnimals(formattedAnimals);
      }
    });
  }, []);

  const handleIntervalChange = (animalId, species, newInterval) => {
    const animalRef = ref(database, `Animals/${species}/${animalId}`);
    update(animalRef, { upload_interval: parseInt(newInterval) || 0 });
  };

  return (
    <div className="remote-control-menu show">
      <div className="remote-control-header">
        <span className="plus-sign">+</span>
        <span className="remote-control-title">Remote Control Tag</span>
        <span className="close-sign">×</span>
      </div>
      <div className="remote-control-filters">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="remote-control-list">
        {animals.map(animal => (
          <div key={animal.id} className="animal-item">
            <img 
              src={getAnimalIcon(animal.species)} 
              alt={animal.species} 
              className="animal-image" 
            />
            <span className="entry-number">{animal.id}</span>
            <span className="animal-name">{animal.name}</span>
            <input
              type="number"
              className="interval-input"
              value={animal.upload_interval || 0}
              onChange={(e) => handleIntervalChange(animal.id, animal.species, e.target.value)}
            />
            <span className="animal-day-time">
              <div>{animal.date}</div>
              <div>{animal.time}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="Locate" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoteControlMenu;
```


### File: pages\realtime\menus\ReportMenu.js
```
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';
import { getReportIcon } from '../utils/icons';
import locationIcon from '../../../assets/location.png';

const ReportMenu = ({ onReportSelect }) => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const reportsRef = ref(database, 'Reports');
    return onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedReports = Object.entries(data).flatMap(([category, reports]) =>
          Object.entries(reports).map(([id, report]) => ({
            id,
            category,
            ...report
          }))
        );
        setReports(formattedReports);
      }
    });
  }, []);

  const filteredReports = reports.filter(report =>
    report.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="report-menu show">
      <div className="report-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Reports</span>
        <span className="close-sign">×</span>
      </div>
      <div className="report-filters">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
      </div>
      <div className="report-list">
        {filteredReports.map(report => (
          <div 
            key={report.id} 
            className="report-item"
            onClick={() => onReportSelect(report)}
          >
            <img 
              src={getReportIcon(report.category)} 
              alt={report.category} 
              className="report-image" 
            />
            <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
            <span className="report-day-time">
              <div>{new Date(report.timestamp).toLocaleDateString()}</div>
              <div>{new Date(report.timestamp).toLocaleTimeString()}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="Locate" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportMenu;
```


## Directory: pages\realtime\modals


### File: pages\realtime\modals\index.js
```
export { default as ReportModal } from './ReportModal';
```


### File: pages\realtime\modals\ReportModals.js
```
import React from 'react';

const ReportModal = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{report.category.replace(/_/g, ' ')}</h2>
        <p><strong>Reported by:</strong> {report.reported_by}</p>
        <p><strong>Report Time:</strong> {report.time}</p>
        <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Lng}</p>
        {report.species && <p><strong>Species:</strong> {report.species}</p>}
        {report.cause_of_injury && <p><strong>Cause of Injury:</strong> {report.cause_of_injury}</p>}
        {report.cause_of_fire && <p><strong>Fire Cause:</strong> {report.cause_of_fire}</p>}
        <p><strong>Action Taken:</strong> {report.action_taken}</p>
        <p><strong>Notes:</strong> {report.notes}</p>
        {report.pictures && (
          <div>
            <h3>Attached Images</h3>
            {report.pictures.map((img, index) => (
              <img key={index} src={img} alt="Attached" className="attached-image" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
```


### File: pages\realtime\Sidebar.js
```
import React from 'react';
import reportsIcon from '../../assets/reports.png';
import patrolsIcon from '../../assets/patrols.png';
import layersIcon from '../../assets/layers.png';
import animalIcon from '../../assets/animal.png';
import remoteControlIcon from '../../assets/Remote Control Tag.png';

const Sidebar = ({ onMenuSelect, activeMenu }) => {
  const menuItems = [
    { id: 'reports', icon: reportsIcon, label: 'Reports' },
    { id: 'patrols', icon: patrolsIcon, label: 'Patrols' },
    { id: 'layers', icon: layersIcon, label: 'Layers' },
    { id: 'animals', icon: animalIcon, label: 'Animals' },
    { id: 'remoteControl', icon: remoteControlIcon, label: 'Remote Control' }
  ];

  return (
    <div className="fixed-sidebar">
      {menuItems.map(item => (
        <button 
          key={item.id}
          className={`sidebar-button ${activeMenu === item.id ? 'active' : ''}`}
          onClick={() => onMenuSelect(item.id)}
        >
          <img src={item.icon} alt={item.label} className="sidebar-icon" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
```


## Directory: pages\realtime\utils


### File: pages\realtime\utils\dataUtils.js
```

export const processAnimalData = (rawData) => {
    if (!rawData) return [];
  
    return Object.entries(rawData).flatMap(([species, animals]) =>
      Object.entries(animals).map(([id, animal]) => {
        const latestTimestamp = Object.keys(animal.location).sort().pop();
        const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
        const location = animal.location[latestTimestamp][latestTime];
  
        return {
          id,
          species: species.slice(0, -1), // Remove 's' from end (e.g., "Elephants" -> "Elephant")
          name: animal.name,
          sex: animal.sex,
          age: animal.age,
          temp: location.temperature || 'N/A',
          activity: location.activity || 'N/A',
          location: {
            Lat: parseFloat(location.Lat),
            Lng: parseFloat(location.Long)
          },
          upload_interval: parseInt(animal.upload_interval) || 0,
          timestamp: latestTimestamp,
          time: latestTime
        };
      })
    );
  };
  
  export const processReportData = (rawData) => {
    if (!rawData) return [];
  
    return Object.entries(rawData).flatMap(([category, reports]) =>
      Object.entries(reports).map(([id, report]) => ({
        id,
        category,
        ...report,
        location: {
          Lat: parseFloat(report.location.Lat),
          Lng: parseFloat(report.location.Long)
        }
      }))
    );
  };
  
  export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTimeString(date)
    };
  };
  
  const getRelativeTimeString = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
```


### File: pages\realtime\utils\icons.js
```
import elephantIcon from '../../../assets/elephant.png';
import lionIcon from '../../../assets/lion.png';
import giraffeIcon from '../../../assets/giraffe.png';
import rhinoIcon from '../../../assets/rhino.png';
import leopardIcon from '../../../assets/leopard.png';
import CTIcon from '../../../assets/CT_Icon_Sighting.png';
import fireIcon from '../../../assets/Fire.png';
import humanWildlifeIcon from '../../../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../../../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../../../assets/Invasive_Species_Sighting.png';
import rainfallIcon from '../../../assets/Rainfall.png';
import rhinoSightingIcon from '../../../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../../../assets/Wildlife_Sighting.png';
import { Icon } from 'leaflet';

export const getAnimalIcon = (species) => {
  const iconUrl = 
    species.toLowerCase().includes('elephant') ? elephantIcon :
    species.toLowerCase().includes('lion') ? lionIcon :
    species.toLowerCase().includes('giraffe') ? giraffeIcon :
    species.toLowerCase().includes('rhino') ? rhinoIcon :
    species.toLowerCase().includes('leopard') ? leopardIcon :
    elephantIcon; // default icon

  return new Icon({
    iconUrl,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });
};

export const getReportIcon = (category) => {
  const iconMap = {
    'CT_Icon_Sighting': CTIcon,
    'Fire': fireIcon,
    'Human_Wildlife_Contact': humanWildlifeIcon,
    'Injured_Animal': injuredAnimalIcon,
    'Invasive_Species_Sighting': invasiveSpeciesIcon,
    'Rainfall': rainfallIcon,
    'Rhino_Sighting': rhinoSightingIcon,
    'Wildlife_Sighting': wildlifeSightingIcon
  };

  return iconMap[category] || wildlifeSightingIcon;
};
```


### File: pages\realtime\utils\mapUtils.js
```

import { latLngBounds } from 'leaflet';

export const calculateMapBounds = (markers) => {
  if (!markers.length) return null;
  
  const bounds = latLngBounds([]);
  markers.forEach(marker => {
    bounds.extend([marker.location.Lat, marker.location.Lng]);
  });
  
  return bounds;
};

export const createClusterCustomIcon = (cluster) => {
  return {
    html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
    className: 'custom-marker-cluster',
  };
};

export const MAP_SETTINGS = {
  defaultCenter: [-1.948, 34.1665],
  defaultZoom: 16,
  maxZoom: 18,
  minZoom: 5
};

```


### File: pages\RealTime - simple.js
```
import '../styles/RealTime.css';
import "leaflet/dist/leaflet.css";
import React, { useState } from 'react';
import Reports from './RealtimeContents/Reports';
import Animals from './RealtimeContents/Animals';
import Layers from './RealtimeContents/Layers';
import Patrols from './RealtimeContents/Patrols';
import Map from './RealtimeContents/Map'; // Import the new Map component

import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';

export default function RealTime() {
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
  };

  return (
    <div className="realtime-container">
      <Sidebar
        isReportMenuVisible={isReportMenuVisible}
        isPatrolMenuVisible={isPatrolMenuVisible}
        isLayerMenuVisible={isLayerMenuVisible}
        isAnimalMenuVisible={isAnimalMenuVisible}
        toggleReportMenu={toggleReportMenu}
        togglePatrolMenu={togglePatrolMenu}
        toggleLayerMenu={toggleLayerMenu}
        toggleAnimalMenu={toggleAnimalMenu}
      />
      <Map />
      {isLayerMenuVisible && <Layers />}
      {isReportMenuVisible && <Reports />}
      {isPatrolMenuVisible && <Patrols />}
      {isAnimalMenuVisible && <Animals />}
    </div>
  );
}

const Sidebar = () => {
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
  };

  return (
    <div className="fixed-sidebar">
      <button className="sidebar-button" onClick={toggleReportMenu}>
        <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
        <span>Reports</span>
      </button>
      <button className="sidebar-button" onClick={togglePatrolMenu}>
        <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
        <span>Patrols</span>
      </button>
      <button className="sidebar-button" onClick={toggleLayerMenu}>
        <img src={layersIcon} alt="Layers" className="sidebar-icon" />
        <span>Layers</span>
      </button>
      <button className="sidebar-button" onClick={toggleAnimalMenu}>
        <img src={animalIcon} alt="Animals" className="sidebar-icon" />
        <span>Animals</span>
      </button>
    </div>
  );
};

```


### File: pages\RealTime copy 2.js
```
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';
import elephantIcon from '../assets/elephant.png';
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';
import locationIcon from '../assets/location.png';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, divIcon } from 'leaflet';
import '../styles/RealTime.css';

const RealTime = () => {
  const [animalData, setAnimalData] = useState([]);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);

  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    
    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];
          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            date: latestTimestamp,
            time: latestTime,
          };
        });

        setAnimalData((prevData) => [...prevData, ...animalArray]);
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  const createCustomClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster",
    });
  };

  const createMarkerIcon = (species) => {
    let iconUrl;
    switch (species) {
      case 'Elephant':
        iconUrl = elephantIcon;
        break;
      case 'Lion':
        iconUrl = lionIcon;
        break;
      case 'Giraffe':
        iconUrl = giraffeIcon;
        break;
      case 'Rhino':
        iconUrl = rhinoIcon;
        break;
      case 'Leopard':
        iconUrl = leopardIcon;
        break;
      default:
        iconUrl = animalIcon;
        break;
    }
    return new Icon({
      iconUrl,
      iconSize: [38, 38],
    });
  };

  const toggleMenu = (menuSetter) => {
    menuSetter(prev => !prev);
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  return (
    <div className="realtime-container">
      <MapContainer center={[34.166586, -1.948311]} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createCustomClusterIcon}
        >
          {animalData.map(animal => (
            <Marker key={animal.id} position={[animal.location.Lat, animal.location.Lng]} icon={createMarkerIcon(animal.species)}>
              <Popup>
                <div>
                  <strong>{animal.species}</strong><br />
                  Sex: {animal.sex}<br />
                  Age: {animal.age} years<br />
                  Date: {animal.date}<br />
                  Time: {animal.time}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* <div className="fixed-sidebar">
        <button className="sidebar-button" onClick={() => toggleMenu(setIsReportMenuVisible)}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={() => toggleMenu(setIsPatrolMenuVisible)}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={() => toggleMenu(setIsLayerMenuVisible)}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={() => toggleMenu(setIsAnimalMenuVisible)}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
      </div> */}
    </div>
  );
};

export default RealTime;

```


### File: pages\RealTime copy 3.js
```
import '../styles/RealTime.css';
import "leaflet/dist/leaflet.css"

import { ref, onValue } from 'firebase/database';
import { database } from '../firebase'; // Adjust the path if needed

import FireIcon from '../assets/Fire.png'
import HumanWildlifeContactIcon from '../assets/Human_Wildlife_Contact.png'
import InjuredAnimalIcon from '../assets/Injured_Animal.png'
import InvasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png'
import RainfallIcon from '../assets/Rainfall.png'
import RhinoSightingIcon from '../assets/Rhino_Sighting.png'
import WildlifeSightingIcon from '../assets/Wildlife_Sighting.png'
// import ctIcon from '../assets/CT_Icon_Sighting.png';

import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';
import remoteControlIcon from '../assets/Remote Control Tag.png'

import outdoorsIcon from '../assets/outdoors.png';
import lightIcon from '../assets/light.png';
import darkIcon from '../assets/dark.png';
import satelliteIcon from '../assets/satellite.png';
import threeDIcon from '../assets/3d.png';
import heatmapIcon from '../assets/heatmap.png';
import locationIcon from '../assets/location.png'

import CTIcon from '../assets/CT_Icon_Sighting.png';
import fireIcon from '../assets/Fire.png';
import humanWildlifeIcon from '../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png';
import rainfallIcon from '../assets/Rainfall.png';
import rhinoSightingIcon from '../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../assets/Wildlife_Sighting.png';

import elephantIcon from '../assets/elephant.png'
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';

export default function RealTime() {
  const [animalData, setAnimalData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [map] = useState(null);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);
  const [isRemoteControlMenuVisible, setIsRemoteControlMenuVisible] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = [];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];

          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            date: latestTimestamp,
            time: latestTime,
          };
        });
        fetchedData.push(...animalArray);
        setAnimalData(fetchedData);
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  useEffect(() => {
    const reportCategories = [
      'CT_Icon_Sighting',
      'Fire',
      'Human_Wildlife_Contact',
      'Injured_Animal',
      'Invasive_Species_Sighting',
      'Rainfall',
      'Rhino_Sighting',
      'Wildlife_Sighting'
    ];
    const fetchedReports = [];

    reportCategories.forEach((category) => {
      const reportsRef = ref(database, `Reports/${category}`);
      onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        const reportArray = Object.keys(data).map((key) => {
          const report = data[key];
          return {
            ...report,
            id: key,
            category,
            location: {
              Lat: parseFloat(report.location.Lat),
              Lng: parseFloat(report.location.Long),
            },
            timestamp: report.timestamp
          };
        });
        fetchedReports.push(...reportArray);
        setReportData(fetchedReports);
      }, (error) => {
        console.error('Error fetching report data:', error);
      });
    });
  }, []);

  const handleLayerChange = (style) => {
    if (map) {
      map.setStyle(`mapbox://styles/${style}`);
    }
  };

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleRemoteControlMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(!isRemoteControlMenuVisible);
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>{report.category.replace(/_/g, ' ')}</h2>
          <p><strong>Reported by:</strong> {report.reported_by}</p>
          <p><strong>Report Time:</strong> {report.time}</p>
          <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Long}</p>
          {report.species && <p><strong>Species:</strong> {report.species}</p>}
          {report.cause_of_injury && <p><strong>Cause of Injury:</strong> {report.cause_of_injury}</p>}
          {report.cause_of_fire && <p><strong>Fire Cause:</strong> {report.cause_of_fire}</p>}
          <p><strong>Action Taken:</strong> {report.action_taken}</p>
          <p><strong>Notes:</strong> {report.notes}</p>
          {report.pictures && (
            <div>
              <h3>Attached Images</h3>
              {report.pictures.map((img, index) => (
                <img key={index} src={img} alt="Attached" className="attached-image" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="realtime-container">
      <div className="fixed-sidebar">
        <button className="sidebar-button" onClick={toggleReportMenu}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={togglePatrolMenu}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={toggleLayerMenu}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={toggleAnimalMenu}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
        <button className="sidebar-button" onClick={toggleRemoteControlMenu}>
          <img src={remoteControlIcon} alt="Remote Control" className="sidebar-icon" />
          <span>Remote<br></br>Control</span>
        </button>
      </div>


      <MapContainer className="map" center={[-1.948, 34.1665]} zoom={16}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {reportData.map(report => {
            const reportIcon = new Icon({
              iconUrl:
                report.category === 'CT_Icon_Sighting' ? CTIcon :
                  report.category === 'Fire' ? fireIcon :
                    report.category === 'Human_Wildlife_Contact' ? humanWildlifeIcon :
                      report.category === 'Injured_Animal' ? injuredAnimalIcon :
                        report.category === 'Invasive_Species_Sighting' ? invasiveSpeciesIcon :
                          report.category === 'Rainfall' ? rainfallIcon :
                            report.category === 'Rhino_Sighting' ? rhinoSightingIcon :
                              wildlifeSightingIcon, // Default icon
              iconSize: [38, 38]
            });

            return (
              <Marker
                key={report.id}
                position={[report.location.Lat, report.location.Lng]}
                icon={reportIcon}
              >
                <Popup>
                  <div style={{ padding: '0px', borderRadius: '1px' }}>
                    <strong>{report.category.replace(/_/g, ' ')}</strong><br />
                    Location: {report.location.Lat}, {report.location.Long}<br />
                    Timestamp: {report.timestamp}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {animalData.map(animal => {
            // Determine the icon based on species
            const speciesIcon = new Icon({
              iconUrl:
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
                      animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                        animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                          animalIcon, // Default icon for other species
              iconSize: [38, 38] // Adjust size as needed
            });

            return (
              <Marker
                key={animal.id} // Ensure each marker has a unique key
                position={[animal.location.Lat, animal.location.Lng]}
                icon={speciesIcon} // Use species-specific icon
              >
                <Popup>
                  <div style={{ padding: '0px', borderRadius: '1px' }}>
                    <strong>{animal.name}</strong><br />
                    Sex: {animal.sex}<br />
                    Age: {animal.age} years<br />
                    Temp: {animal.temp} °C<br />
                    Activity: {animal.activity}
                  </div>
                </Popup>

              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      <div id="layer-menu" className={`layer-menu ${isLayerMenuVisible ? 'show' : 'hide'}`}>
        <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
          <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
          Outdoors
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
          <img src={lightIcon} alt="Light" className="layer-icon" />
          Light
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
          <img src={darkIcon} alt="Dark" className="layer-icon" />
          Dark
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
          <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
          Satellite
        </button>
        <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
          <img src={threeDIcon} alt="3D" className="layer-icon" />
          3D
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/heatmap-v10')}>
          <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
          Heatmap
        </button>
      </div>

      <div id="report-menu" className={`report-menu ${isReportMenuVisible ? 'show' : 'hide'}`}>
        <div className="report-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Reports</span>
          <span className="close-sign" onClick={toggleReportMenu}>x</span>
        </div>
        <div className="report-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="report-summary">
          <span>{reportData.length} results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="report-list">
          {reportData.map((report) => (
            <div
              key={report.id}
              className="report-item"
              onClick={() => openModal(report)} // Open modal on click
            >
              <img src={
                report.category === 'CT_Icon_Sighting' ? CTIcon :
                  report.category === 'Fire' ? FireIcon :
                    report.category === 'Human_Wildlife_Contact' ? HumanWildlifeContactIcon :
                      report.category === 'Injured_Animal' ? InjuredAnimalIcon :
                        report.category === 'Invasive_Species_Sighting' ? InvasiveSpeciesIcon :
                          report.category === 'Rainfall' ? RainfallIcon :
                            report.category === 'Rhino_Sighting' ? RhinoSightingIcon :
                              WildlifeSightingIcon  // Default icon for other categories
              } alt="report" className="report-image" />
              <span className="entry-number">{report.id}</span>
              <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
              <span className="report-day-time">
                <div className="report-date"> {/* Date logic here */} </div>
                <div className="report-time"> {/* Time logic here */} </div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>

      </div>

      <div id="patrol-menu" className={`patrol-menu ${isPatrolMenuVisible ? 'show' : 'hide'}`}>
        <div className="patrol-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Patrol Officers</span>
          <span className="close-sign" onClick={togglePatrolMenu}>x</span>
        </div>
        <div className="patrol-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="patrol-summary">
          <span>1 results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="patrol-list">
          {/* Replace with dynamic data */}
          <div className="patrol-item">
            <img src={patrolsIcon} alt="patrol" className="patrol-image" />
            <span className="entry-number">1</span>
            <span className="report-name">Elisa Kikota</span>
            <span className="report-day-time">
              <div classname="patrol-date">9th Aug 2024</div>
              <div classname="patrol-time">12:30 PM</div>
            </span>
            <button className="locate-icon">{<img src={locationIcon} alt="locationIcon" className="layer-icon" />}</button>
          </div>
          {/* Repeat for other reports */}
        </div>
      </div>

      <div id="animal-menu" className={`animal-menu ${isAnimalMenuVisible ? 'show' : 'hide'}`}>
        <div className="animal-header">
          <span className="plus-sign">+</span>
          <span className="animal-title">Animals</span>
          <span className="close-sign" onClick={() => setIsAnimalMenuVisible(false)}>x</span>
        </div>
        <div className="animal-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="animal-summary">
          <span>{animalData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="animal-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />
              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>
              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>

      </div>

      <div id="remote-control-menu" className={`remote-control-menu ${isRemoteControlMenuVisible ? 'show' : 'hide'}`}>
        <div className="remote-control-header">
          <span className="plus-sign">+</span>
          <span className="remote-control-title">Remote Control Tag</span>
          <span className="close-sign" onClick={toggleReportMenu}>x</span>
        </div>
        <div className="remote-control-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="remote-control-summary">
          <span>{reportData.length} results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="remote-control-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />
              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>
              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ReportModal report={selectedReport} onClose={closeModal} />
      )}


    </div>
  );
}

```


### File: pages\RealTime copy.js
```
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase'; // Adjust the path if needed


import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import outdoorsIcon from '../assets/outdoors.png';
import lightIcon from '../assets/light.png';
import darkIcon from '../assets/dark.png';
import satelliteIcon from '../assets/satellite.png';
import animalIcon from '../assets/animal.png';
import threeDIcon from '../assets/3d.png';
import heatmapIcon from '../assets/heatmap.png';
import locationIcon from '../assets/location.png'


import elephantIcon from '../assets/elephant.png'
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';


import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import '../styles/RealTime.css';


mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2FraWtvdGEiLCJhIjoiY2x6MTkwYWRiMnE0ZTJpcjR5bzFjMzNrZyJ9.HRBoAER-bGLPEcdhbUsW_A';
// mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2FraWtvdGEiLCJhIjoiY20wMmRsY2gzMDAyczJ2cjFpZ2FudnR0ayJ9.LI2OnTDNopBb5YcHHJ2Xqg';

const RealTime = () => {
  const [animalData, setAnimalData] = useState([]);
  const [map, setMap] = useState(null);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);


  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [34.166586,-1.948311],
      zoom: 17.3,
      attributionControl: false,
    });
  
    mapInstance.on('load', () => {
      const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
      
      animalSpecies.forEach((species) => {
        const animalsRef = ref(database, `Animals/${species}`);
        onValue(animalsRef, (snapshot) => {
          const data = snapshot.val();
          const animalArray = Object.keys(data).map((key) => {
            const animal = data[key];
            const latestTimestamp = Object.keys(animal.location).sort().pop();
            const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
            const location = animal.location[latestTimestamp][latestTime];
  
            return {
              ...animal,
              id: key,
              species: species.slice(0, -1), // Convert 'Elephants' to 'Elephant'
              location: {
                Lat: parseFloat(location.Lat),
                Lng: parseFloat(location.Long),
              },
              date: latestTimestamp, // This is the latest date
              time: latestTime,      // This is the latest time
            };
          });
  
          setAnimalData((prevData) => [...prevData, ...animalArray]);
  
          animalArray.forEach((animal) => {
            if (!isNaN(animal.location.Lat) && !isNaN(animal.location.Lng)) {
              new mapboxgl.Marker({ element: createMarkerElement(animal.species) })
                .setLngLat([animal.location.Lng, animal.location.Lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                  `<div 
                      style="
                        background-color: #f0f0f0; 
                        padding: 10px;
                        border-radius:20;"
                      width:30;>
                    <strong>${animal.species}</strong><br />
                    Sex: ${animal.sex}<br />
                    Age: ${animal.age} years<br />
                    Date: ${animal.date}<br /> 
                    Time: ${animal.time} 
                  </div>`
                ))
                .addTo(mapInstance);
            } else {
              console.error('Invalid coordinates for animal:', animal);
            }
          });
          
        }, (error) => {
          console.error('Error fetching animal data:', error);
        });
      });
    });
  
    setMap(mapInstance);
  
    return () => mapInstance.remove();
  }, []);
  


  const createMarkerElement = (species) => {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker';
    let iconUrl;
  
    switch (species) {
      case 'Elephant':
        iconUrl = elephantIcon;
        break;
      case 'Lion':
        iconUrl = lionIcon;
        break;
      case 'Giraffe':
        iconUrl = giraffeIcon;
        break;
      case 'Rhino':
        iconUrl = rhinoIcon;
        break;
      case 'Leopard':
        iconUrl = leopardIcon;
        break;
      default:
        iconUrl = animalIcon; // Fallback icon
        break;
    }
  
    markerDiv.style.backgroundImage = `url(${iconUrl})`;
    markerDiv.style.backgroundSize = 'cover';
    markerDiv.style.width = '32px';
    markerDiv.style.height = '32px';
    return markerDiv;
  };
  

  const handleLayerChange = (style) => {
    if (map) {
      map.setStyle(`mapbox://styles/${style}`);
    }
  };


  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false); 
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
  };
  
  

  return (
    <div className="realtime-container">
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
      <div className="fixed-sidebar">
      <button className="sidebar-button" onClick={toggleReportMenu}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={togglePatrolMenu}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={toggleLayerMenu}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={toggleAnimalMenu}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>

        <div id="layer-menu" className={`layer-menu ${isLayerMenuVisible ? 'show' : 'hide'}`}>
          <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
            <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
            Outdoors
          </button>
          <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
            <img src={lightIcon} alt="Light" className="layer-icon" />
            Light
          </button>
          <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
            <img src={darkIcon} alt="Dark" className="layer-icon" />
            Dark
          </button>
          <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
            <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
            Satellite
          </button>
          <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
            <img src={threeDIcon} alt="3D View" className="layer-icon" />
            3D View
          </button>
          <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjjqpdi00jo01r37ot6asfi')}>
            <img src={heatmapIcon} alt="HeatMap" className="layer-icon" />
            HeatMap
          </button>
        </div>
      </div>
      
      <div id="report-menu" className={`report-menu ${isReportMenuVisible ? 'show' : 'hide'}`}>
        <div className="report-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Reports</span>
          <span className="close-sign" onClick={toggleReportMenu}>x</span>
        </div>
        <div className="report-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="report-summary">
          <span>1 results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="report-list">
          {/* Replace with dynamic data */}
          <div className="report-item">
            <img src={reportsIcon} alt="Report" className="report-image" />
            <span className="entry-number">2</span>
            <span className="report-name">Antelope Injury</span>
            <span className="report-day-time">
              <div classname="report-date">9th Aug 2024</div>
              <div classname="report-time">12:30 PM</div>
            </span>
            <button className="locate-icon">{ <img src={locationIcon} alt="locationIcon" className="layer-icon" />}</button>
          </div>
          {/* Repeat for other reports */}
        </div>
      </div>

      <div id="patrol-menu" className={`patrol-menu ${isPatrolMenuVisible ? 'show' : 'hide'}`}>
        <div className="patrol-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Patrol Officers</span>
          <span className="close-sign" onClick={togglePatrolMenu}>x</span>
        </div>
        <div className="patrol-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="patrol-summary">
          <span>1 results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="patrol-list">
          {/* Replace with dynamic data */}
          <div className="patrol-item">
            <img src={patrolsIcon} alt="patrol" className="patrol-image" />
            <span className="entry-number">1</span>
            <span className="report-name">Elisa Kikota</span>
            <span className="report-day-time">
              <div classname="patrol-date">9th Aug 2024</div>
              <div classname="patrol-time">12:30 PM</div>
            </span>
            <button className="locate-icon">{ <img src={locationIcon} alt="locationIcon" className="layer-icon" />}</button>
          </div>
          {/* Repeat for other reports */}
        </div>
      </div>
      
      <div id="animal-menu" className={`animal-menu ${isAnimalMenuVisible ? 'show' : 'hide'}`}>
        <div className="animal-header">
          <span className="plus-sign">+</span>
          <span className="animal-title">Animals</span>
          <span className="close-sign" onClick={() => setIsAnimalMenuVisible(false)}>x</span>
        </div>
        <div className="animal-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="animal-summary">
          <span>{animalData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="animal-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                animal.species.toLowerCase() === 'lion' ? lionIcon :
                animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />
              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>
              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
        ))}
      </div>

      </div>
);


    </div>
  );
};

export default RealTime;

```


### File: pages\RealTime.js
```
import '../styles/RealTime.css';
import "leaflet/dist/leaflet.css"

import React, { useEffect, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { database } from '../firebase'; // Adjust the path if needed

import ReportMenu from './ReportMenu';  // Adjust the path as needed


// import ctIcon from '../assets/CT_Icon_Sighting.png';

import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';
import remoteControlIcon from '../assets/Remote Control Tag.png'

import outdoorsIcon from '../assets/outdoors.png';
import lightIcon from '../assets/light.png';
import darkIcon from '../assets/dark.png';
import satelliteIcon from '../assets/satellite.png';
import threeDIcon from '../assets/3d.png';
import heatmapIcon from '../assets/heatmap.png';
import locationIcon from '../assets/location.png'

import CTIcon from '../assets/CT_Icon_Sighting.png';
import fireIcon from '../assets/Fire.png';
import humanWildlifeIcon from '../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png';
import rainfallIcon from '../assets/Rainfall.png';
import rhinoSightingIcon from '../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../assets/Wildlife_Sighting.png';

import elephantIcon from '../assets/elephant.png'
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';

import { Icon } from "leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';

export default function RealTime() {
  const [animalData, setAnimalData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [map] = useState(null);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);
  const [isRemoteControlMenuVisible, setIsRemoteControlMenuVisible] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];

          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            upload_interval: parseInt(animal.upload_interval) || 0, // Parse as integer, default to 0
            date: latestTimestamp,
            time: latestTime,
          };
        });

        setAnimalData(prevData => {
          const updatedData = [...prevData];
          animalArray.forEach(newAnimal => {
            const index = updatedData.findIndex(animal => animal.id === newAnimal.id);
            if (index !== -1) {
              updatedData[index] = newAnimal;
            } else {
              updatedData.push(newAnimal);
            }
          });
          return updatedData;
        });
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  useEffect(() => {
    const reportCategories = [
      'CT_Icon_Sighting',
      'Fire',
      'Human_Wildlife_Contact',
      'Injured_Animal',
      'Invasive_Species_Sighting',
      'Rainfall',
      'Rhino_Sighting',
      'Wildlife_Sighting'
    ];

    const reportsRef = ref(database, 'Reports');

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedReports = reportCategories.flatMap(category => {
          const categoryReports = data[category] || {};
          return Object.entries(categoryReports).map(([key, report]) => ({
            ...report,
            id: key,
            category,
            location: {
              Lat: parseFloat(report.location.Lat),
              Lng: parseFloat(report.location.Long),
            },
            timestamp: report.timestamp
          }));
        });
        setReportData(fetchedReports);
      }
    }, (error) => {
      console.error('Error fetching report data:', error);
    });

    return () => unsubscribe();
  }, []);

  // const fetchedReports = [];


  // reportCategories.forEach((category) => {
  //   const reportsRef = ref(database, `Reports/${category}`);
  //   onValue(reportsRef, (snapshot) => {
  //     const data = snapshot.val();
  //     const reportArray = Object.keys(data).map((key) => {
  //       const report = data[key];
  //       return {
  //         ...report,
  //         id: key,
  //         category,

  //         location: {
  //           Lat: parseFloat(report.location.Lat),
  //           Lng: parseFloat(report.location.Long),
  //         },
  //         timestamp: report.timestamp
  //       };
  //     });
  //     fetchedReports.push(...reportArray);
  //     setReportData(fetchedReports);
  //   }, (error) => {
  //     console.error('Error fetching report data:', error);
  //   });
  // });


  const handleLayerChange = (style) => {
    if (map) {
      map.setStyle(`mapbox://styles/${style}`);
    }
  };

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleRemoteControlMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(!isRemoteControlMenuVisible);
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>{report.category.replace(/_/g, ' ')}</h2>
          <p><strong>Reported by:</strong> {report.reported_by}</p>
          <p><strong>Report Time:</strong> {report.time}</p>
          <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Lng}</p>
          {report.species && <p><strong>Species:</strong> {report.species}</p>}
          {report.cause_of_injury && <p><strong>Cause of Injury:</strong> {report.cause_of_injury}</p>}
          {report.cause_of_fire && <p><strong>Fire Cause:</strong> {report.cause_of_fire}</p>}
          <p><strong>Action Taken:</strong> {report.action_taken}</p>
          <p><strong>Notes:</strong> {report.notes}</p>
          {report.pictures && (
            <div>
              <h3>Attached Images</h3>
              {report.pictures.map((img, index) => (
                <img key={index} src={img} alt="Attached" className="attached-image" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleIntervalChange = (e, animalId, species) => {
    const newIntervalString = e.target.value;
    const newInterval = newIntervalString === '' ? 0 : parseInt(newIntervalString, 10);

    if (isNaN(newInterval)) {
      console.error('Invalid input: Not a number');
      return; // Exit the function if input is not a valid number
    }

    // Update local state immediately to reflect in the input field
    setAnimalData(prevData =>
      prevData.map(animal =>
        animal.id === animalId
          ? { ...animal, upload_interval: newInterval }
          : animal
      )
    );

    // Clear the previous timeout to prevent multiple updates
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to update Firebase after a short delay
    const timeoutId = setTimeout(() => {
      const pluralSpecies = species === 'Elephant' ? 'Elephants' :
        species === 'Lion' ? 'Lions' :
          species === 'Giraffe' ? 'Giraffes' :
            species === 'Rhino' ? 'Rhinos' :
              species === 'Leopard' ? 'Leopards' : species;

      // Update Firebase after the delay
      const animalRef = ref(database, `Animals/${pluralSpecies}/${animalId}`);
      update(animalRef, {
        upload_interval: newInterval
      })
        .then(() => {
          console.log("Upload interval updated successfully in Firebase");
        })
        .catch((error) => {
          console.error("Error updating upload interval in Firebase:", error);
          // Revert local state if Firebase update fails
          setAnimalData(prevData =>
            prevData.map(animal =>
              animal.id === animalId
                ? { ...animal, upload_interval: animal.upload_interval }
                : animal
            )
          );
        });
    }, 1000); // Update Firebase after 1 second delay

    setTypingTimeout(timeoutId); // Store the timeout ID
  };

  return (
    <div className="realtime-container">
      <div className="fixed-sidebar">
        <button className="sidebar-button" onClick={toggleReportMenu}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={togglePatrolMenu}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={toggleLayerMenu}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={toggleAnimalMenu}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
        <button className="sidebar-button" onClick={toggleRemoteControlMenu}>
          <img src={remoteControlIcon} alt="Remote Control" className="sidebar-icon" />
          <span>Remote<br></br>Control</span>
        </button>
      </div>

      <MapContainer className="map" center={[-1.948, 34.1665]} zoom={16} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {reportData.map(report => {
            const reportIcon = new Icon({
              iconUrl:
                report.category === 'CT_Icon_Sighting' ? CTIcon :
                  report.category === 'Fire' ? fireIcon :
                    report.category === 'Human_Wildlife_Contact' ? humanWildlifeIcon :
                      report.category === 'Injured_Animal' ? injuredAnimalIcon :
                        report.category === 'Invasive_Species_Sighting' ? invasiveSpeciesIcon :
                          report.category === 'Rainfall' ? rainfallIcon :
                            report.category === 'Rhino_Sighting' ? rhinoSightingIcon :
                              wildlifeSightingIcon, // Default icon
              iconSize: [38, 38]
            });

            return (
              <Marker
                key={report.id}
                position={[report.location.Lat, report.location.Lng]}
                icon={reportIcon}
              >
                <Popup>
                  <div style={{ padding: '0px', borderRadius: '1px' }}>
                    <strong>{report.category.replace(/_/g, ' ')}</strong><br />
                    Location: {report.location.Lat}, {report.location.Long}<br />
                    Timestamp: {report.timestamp}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {animalData.map(animal => {
            // Determine the icon based on species
            const speciesIcon = new Icon({
              iconUrl:
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
                      animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                        animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                          animalIcon, // Default icon for other species
              iconSize: [38, 38] // Adjust size as needed
            });

            return (
              <Marker
                key={animal.id} // Ensure each marker has a unique key
                position={[animal.location.Lat, animal.location.Lng]}
                icon={speciesIcon} // Use species-specific icon
              >
                <Popup>
                  <div style={{ padding: '0px', borderRadius: '1px' }}>
                    <strong>{animal.name}</strong><br />
                    Sex: {animal.sex}<br />
                    Age: {animal.age} years<br />
                    Temp: {animal.temp} °C<br />
                    Activity: {animal.activity}
                  </div>
                </Popup>

              </Marker>
            );
          })}
        </MarkerClusterGroup>
        <ZoomControl position="bottomright" />
      </MapContainer>

      <div id="layer-menu" className={`layer-menu ${isLayerMenuVisible ? 'show' : 'hide'}`}>
        <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
          <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
          Outdoors
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
          <img src={lightIcon} alt="Light" className="layer-icon" />
          Light
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
          <img src={darkIcon} alt="Dark" className="layer-icon" />
          Dark
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
          <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
          Satellite
        </button>
        <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
          <img src={threeDIcon} alt="3D" className="layer-icon" />
          3D
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/heatmap-v10')}>
          <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
          Heatmap
        </button>
      </div>

      <ReportMenu
        isReportMenuVisible={isReportMenuVisible}
        toggleReportMenu={toggleReportMenu}
        reportData={reportData}
        openModal={openModal}
      />

      <div id="patrol-menu" className={`patrol-menu ${isPatrolMenuVisible ? 'show' : 'hide'}`}>
        <div className="patrol-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Patrol Officers</span>
          <span className="close-sign" onClick={togglePatrolMenu}>x</span>
        </div>
        <div className="patrol-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="patrol-summary">
          <span>1 results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="patrol-list">
          {/* Replace with dynamic data */}
          <div className="patrol-item">
            <img src={patrolsIcon} alt="patrol" className="patrol-image" />
            <span className="entry-number">1</span>
            <span className="report-name">Elisa Kikota</span>
            <span className="report-day-time">
              <div classname="patrol-date">9th Aug 2024</div>
              <div classname="patrol-time">12:30 PM</div>
            </span>
            <button className="locate-icon">{<img src={locationIcon} alt="locationIcon" className="layer-icon" />}</button>
          </div>
          {/* Repeat for other reports */}
        </div>
      </div>

      <div id="animal-menu" className={`animal-menu ${isAnimalMenuVisible ? 'show' : 'hide'}`}>
        <div className="animal-header">
          <span className="plus-sign">+</span>
          <span className="animal-title">Animals</span>
          <span className="close-sign" onClick={() => setIsAnimalMenuVisible(false)}>x</span>
        </div>
        <div className="animal-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="animal-summary">
          <span>{animalData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="animal-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />
              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>
              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>

      </div>

      <div id="remote-control-menu" className={`remote-control-menu ${isRemoteControlMenuVisible ? 'show' : 'hide'}`}>
        <div className="remote-control-header">
          <span className="plus-sign">+</span>
          <span className="remote-control-title">Remote Control Tag</span>
          <span className="close-sign" onClick={toggleReportMenu}>x</span>
        </div>
        <div className="remote-control-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="remote-control-summary">
          <span>{reportData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="remote-control-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />

              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>

              {/* Added text box for upload interval */}
              <span className="animal-upload-interval">
                <input
                  type="number"
                  value={animal.upload_interval}
                  placeholder="Enter Interval"
                  className='interval-input'
                  onChange={(e) => handleIntervalChange(e, animal.id, animal.species)}
                />

              </span>


              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>

              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ReportModal report={selectedReport} onClose={closeModal} />
      )}


    </div>
  );
}

```


## Directory: pages\RealtimeContents


### File: pages\RealtimeContents\Animals.js
```
import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { ref, onValue } from 'firebase/database';
import { Icon } from 'leaflet';
import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';
import { database } from '../../firebase'; // Adjusted path
import '../../styles/RealTime.css';

export default function Animals({ isVisible, toggleAnimalMenu }) {
  const [animalData, setAnimalData] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = [];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const animalArray = Object.keys(data).map((key) => {
            const animal = data[key];
            const latestTimestamp = Object.keys(animal.location).sort().pop();
            const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
            const location = animal.location[latestTimestamp][latestTime];
            const temp = location.temperature || 'N/A';
            const activity = location.activity || 'N/A';

            return {
              ...animal,
              id: key,
              species: species.slice(0, -1),
              location: { Lat: parseFloat(location.Lat), Lng: parseFloat(location.Long) },
              date: latestTimestamp,
              time: latestTime,
              temp,
              activity,
            };
          });
          fetchedData.push(...animalArray);
          setAnimalData(fetchedData);
        }
      }, (error) => console.error('Error fetching animal data:', error));
    });
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {animalData.map(animal => {
        const speciesIcon = new Icon({
          iconUrl: animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                    animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                    leopardIcon,
          iconSize: [38, 38]
        });

        return (
          <Marker key={animal.id} position={[animal.location.Lat, animal.location.Lng]} icon={speciesIcon}>
            <Popup>
              <div style={{ padding: '0px', borderRadius: '1px' }}>
                <strong>{animal.name}</strong><br />
                Sex: {animal.sex}<br />
                Age: {animal.age} years<br />
                Temp: {animal.temp} °C<br /> 
                Activity: {animal.activity}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

```


### File: pages\RealtimeContents\Layers.js
```
import React from 'react';
import outdoorsIcon from '../../assets/outdoors.png';
import lightIcon from '../../assets/light.png';
import darkIcon from '../../assets/dark.png';
import satelliteIcon from '../../assets/satellite.png';
import threeDIcon from '../../assets/3d.png';
import heatmapIcon from '../../assets/heatmap.png';
import '../../styles/RealTime.css';

const LayerMenu = ({ isVisible, handleLayerChange, isRealTime, setIsRealTime }) => {
  if (!isVisible) return null;

  return (
    <div id="layer-menu" className={`layer-menu ${isVisible ? 'show' : 'hide'}`}>
      <div className="layer-section tracking-toggle">
        <FormControlLabel
          control={
            <Switch
              checked={isRealTime}
              onChange={(e) => setIsRealTime(e.target.checked)}
              color="primary"
            />
          }
          label={isRealTime ? "Real-time Tracking" : "Last Known Location"}
          className="tracking-toggle-label"
        />
      </div>
      <div className="layer-section map-styles">
        <div className="section-title">Map Style</div>
        <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
          <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
          Outdoors
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
          <img src={lightIcon} alt="Light" className="layer-icon" />
          Light
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
          <img src={darkIcon} alt="Dark" className="layer-icon" />
          Dark
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
          <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
          Satellite
        </button>
        <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
          <img src={threeDIcon} alt="3D" className="layer-icon" />
          3D
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/heatmap-v10')}>
          <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
          Heatmap
        </button>
      </div>
    </div>
  );
};

export default LayerMenu;
```


### File: pages\RealtimeContents\Map.js
```
import { ref, onValue } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon } from "leaflet";
import React, { useEffect, useState } from 'react';

import { database } from '../../firebase';  // Import the database

import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';
import animalIcon from '../../assets/animal.png'; // Fallback icon

const Map = () => {
  const [animalData, setAnimalData] = useState([]); // Define local state

  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = [];
  
    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);  // Use the imported database
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];
  
          const temp = location.temperature || 'N/A';
          const activity = location.activity || 'N/A';
  
          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            date: latestTimestamp,
            time: latestTime,
            temp: temp, 
            activity: activity, 
          };
        });
        fetchedData.push(...animalArray);
        setAnimalData(fetchedData);
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  return (
    <MapContainer className="map" center={[-1.948, 34.1665]} zoom={16}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup chunkedLoading>
        {animalData.map(animal => {
          const speciesIcon = new Icon({
            iconUrl: 
              animal.species.toLowerCase() === 'elephant' ? elephantIcon :
              animal.species.toLowerCase() === 'lion' ? lionIcon :
              animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
              animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
              animal.species.toLowerCase() === 'leopard' ? leopardIcon :
              animalIcon, 
            iconSize: [38, 38]
          });

          return (
            <Marker 
              key={animal.id}
              position={[animal.location.Lat, animal.location.Lng]} 
              icon={speciesIcon}
            >
              <Popup>
                <div style={{ padding: '0px', borderRadius: '1px' }}>
                  <strong>{animal.name}</strong><br />
                  Sex: {animal.sex}<br />
                  Age: {animal.age} years<br />
                  Temp: {animal.temp} °C<br /> 
                  Activity: {animal.activity}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;

```


### File: pages\RealtimeContents\Patrols.js
```
import React from 'react';
import patrolsIcon from '../../assets/patrols.png';
import locationIcon from '../../assets/location.png';
import '../../styles/RealTime.css';

export default function Patrols({ isVisible, togglePatrolMenu }) {
  if (!isVisible) return null;

  return (
    <div id="patrol-menu" className={`patrol-menu ${isVisible ? 'show' : 'hide'}`}>
      <div className="patrol-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Patrol Officers</span>
        <span className="close-sign" onClick={togglePatrolMenu}>x</span>
      </div>
      <div className="patrol-filters">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
        <button className="date-updated-btn">Date Updated</button>
      </div>
      <div className="patrol-summary">
        <span>1 result from about <b>{/* time logic here */} ago until now</b></span>
      </div>
      <div className="patrol-list">
        <div className="patrol-item">
          <img src={patrolsIcon} alt="patrol" className="patrol-image" />
          <span className="entry-number">1</span>
          <span className="report-name">Elisa Kikota</span>
          <span className="report-day-time">
            <div className="patrol-date">9th Aug 2024</div>
            <div className="patrol-time">12:30 PM</div>
          </span>
          <button className="locate-icon"><img src={locationIcon} alt="locationIcon" className="layer-icon" /></button>
        </div>
        {/* Repeat for other patrol officers */}
      </div>
    </div>
  );
}

```


### File: pages\RealtimeContents\RealTime.css
```
.realtime-container {
  /* display: flex; */
  position: relative;
  height: 100vh; /* Use full viewport height */
  overflow:hidden; /* Prevent scrolling */
  }

  #map {
    flex: 1;
    height: 100vh;
    z-index:0;
}

.map {
  flex: 1;
  width: 100vw-70px;
  height:100vw-64px;
  z-index:0;
  margin-left: 70px;
}

.fixed-sidebar {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 70px;
  height:100vh-64px;
  background-color: rgba(31, 118, 206, 0.6);
  padding: 10px 0;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  /* z-index:1; */
}

.sidebar-button {
  background: none;
  border: none;
  color: white;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}

.sidebar-button .sidebar-icon {
  display: block;
  width: 35px;
  height: 35px;
  margin-bottom: 5px;
}
.btn{
  display: flex;
  align-items: center;
  gap:5px;
}
.layer-menu {
  display: none;
  width: 200px;
  background-color: rgba(0, 0, 0, 0.7);
  position: absolute;
  top: 10px;
  left: 80px;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content:space-around; /* Center items vertically */
  align-items: flex-start; /* Align items to the start horizontally */
  gap: 4px;
}

.layer-menu.img {
padding-right: 10px;
}

.layer-menu.show {
  display:block;
  animation: fadeIn 0.3s forwards;
}

.layer-menu.hide {
  animation: fadeOut 0.3s forwards;
}

.layer-menu button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px 10px;
}

.layer-icon {
  width: 30px;
  height: 30px;
  margin-right: 1px;
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}




.report-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 390px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.patrol-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 390px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.animal-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 390px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.remote-control-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 400px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.report-menu.show {
  display: block;
}

.patrol-menu.show {
  display: block;
}

.animal-menu.show {
  display: block;
}

.remote-control-menu.show {
  display: block;
}

.report-header, .report-filters, .report-summary, .report-list {
  margin-bottom: 15px;
}

.patrol-header, .patrol-filters, .patrol-summary, .report-list {
  margin-bottom: 15px;
}

.animal-header, .animal-filters, .animal-summary, .animal-list {
  margin-bottom: 15px;
}

.remote-control-header, .remote-control-filters, .remote-control-summary, .remote-control-list {
  margin-bottom: 15px;
}

.report-time{
  align-items: center;
}
.report-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.patrol-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.animal-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.remote-control-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.plus-sign {
  font-size: 24px;
}

.report-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.patrol-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.animal-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.remote-control-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.close-sign {
  cursor: pointer;
}

.report-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patrol-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.animal-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remote-control-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  width: 40%;
  padding: 5px;
  margin: 4px;
  /* border-radius: 8px; */
}

.filter-btn, .date-btn, .date-updated-btn {
  background-color: #F2F2F4;
  border: none;
  padding: 5px;
  margin: 4px;
  cursor: pointer;
  color: #000000
  
}

.report-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.patrol-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.animal-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.remote-control-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.report-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.patrol-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.animal-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.remote-control-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.report-item {
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.patrol-item {
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.animal-item {
  /* top:100; */
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.remote-control-item {
  /* top:100; */
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.report-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.patrol-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.animal-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.remote-control-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.entry-number{
  /* margin-right: 10px; */
  width:15%;
  /* background-color: #CACCCE; */
}

.report-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.patrol-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.animal-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.remote-control-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.report-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.patrol-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.animal-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.remote-control-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.locate-icon {
  cursor: pointer;
  background: none;
  border: none;
  color: rgb(255, 255, 255);
}

.leaflet-container{
  height:100vh;
}

.leaflet-bottom.leaflet-right{
  height:0;
}

.leaflet-left{
  /* left:0; */
  right:10;
}

.leaflet-control-zoom.leaflet-bar.leaflet-control{
  /* margin-left:0; */
  right:10;
}

/* sizing of map container*/
.leaflet-container{
  height:100vh;
}

.cluster-icon{
  height: 3rem;
  width: 3rem;
  border-radius: 50%;
  background-color: white;
  transform: translate(-25%,-25%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 900;
  font-size: 1.5rem;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  margin-left:480px;
  margin-top:74px;
  background-color: #fefefe;
  /* margin: 15% auto; */
  padding: 20px;
  border: 1px solid #888;
  width:fit-content;
  border-radius: 20px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.attached-image {
  width: 100px;
  margin-right: 10px;
}

.interval-input {
  width: 34px;
  margin-left: 0px;
  margin-right:10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

```


### File: pages\RealtimeContents\RealTime.js
```
import '../styles/RealTime.css';
import "leaflet/dist/leaflet.css"

import React, { useEffect, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { database } from '../firebase'; // Adjust the path if needed

import ReportMenu from './ReportMenu';  // Adjust the path as needed


// import ctIcon from '../assets/CT_Icon_Sighting.png';

import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';
import remoteControlIcon from '../assets/Remote Control Tag.png'

import outdoorsIcon from '../assets/outdoors.png';
import lightIcon from '../assets/light.png';
import darkIcon from '../assets/dark.png';
import satelliteIcon from '../assets/satellite.png';
import threeDIcon from '../assets/3d.png';
import heatmapIcon from '../assets/heatmap.png';
import locationIcon from '../assets/location.png'

import CTIcon from '../assets/CT_Icon_Sighting.png';
import fireIcon from '../assets/Fire.png';
import humanWildlifeIcon from '../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png';
import rainfallIcon from '../assets/Rainfall.png';
import rhinoSightingIcon from '../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../assets/Wildlife_Sighting.png';

import elephantIcon from '../assets/elephant.png'
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';

import { Icon } from "leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';

export default function RealTime() {
  const [animalData, setAnimalData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [map] = useState(null);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);
  const [isRemoteControlMenuVisible, setIsRemoteControlMenuVisible] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];

          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            upload_interval: parseInt(animal.upload_interval) || 0, // Parse as integer, default to 0
            date: latestTimestamp,
            time: latestTime,
          };
        });

        setAnimalData(prevData => {
          const updatedData = [...prevData];
          animalArray.forEach(newAnimal => {
            const index = updatedData.findIndex(animal => animal.id === newAnimal.id);
            if (index !== -1) {
              updatedData[index] = newAnimal;
            } else {
              updatedData.push(newAnimal);
            }
          });
          return updatedData;
        });
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  useEffect(() => {
    const reportCategories = [
      'CT_Icon_Sighting',
      'Fire',
      'Human_Wildlife_Contact',
      'Injured_Animal',
      'Invasive_Species_Sighting',
      'Rainfall',
      'Rhino_Sighting',
      'Wildlife_Sighting'
    ];
    const fetchedReports = [];

    reportCategories.forEach((category) => {
      const reportsRef = ref(database, `Reports/${category}`);
      onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        const reportArray = Object.keys(data).map((key) => {
          const report = data[key];
          return {
            ...report,
            id: key,
            category,

            location: {
              Lat: parseFloat(report.location.Lat),
              Lng: parseFloat(report.location.Long),
            },
            timestamp: report.timestamp
          };
        });
        fetchedReports.push(...reportArray);
        setReportData(fetchedReports);
      }, (error) => {
        console.error('Error fetching report data:', error);
      });
    });
  }, []);

  const handleLayerChange = (style) => {
    if (map) {
      map.setStyle(`mapbox://styles/${style}`);
    }
  };

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleRemoteControlMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(!isRemoteControlMenuVisible);
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>{report.category.replace(/_/g, ' ')}</h2>
          <p><strong>Reported by:</strong> {report.reported_by}</p>
          <p><strong>Report Time:</strong> {report.time}</p>
          <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Long}</p>
          {report.species && <p><strong>Species:</strong> {report.species}</p>}
          {report.cause_of_injury && <p><strong>Cause of Injury:</strong> {report.cause_of_injury}</p>}
          {report.cause_of_fire && <p><strong>Fire Cause:</strong> {report.cause_of_fire}</p>}
          <p><strong>Action Taken:</strong> {report.action_taken}</p>
          <p><strong>Notes:</strong> {report.notes}</p>
          {report.pictures && (
            <div>
              <h3>Attached Images</h3>
              {report.pictures.map((img, index) => (
                <img key={index} src={img} alt="Attached" className="attached-image" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleIntervalChange = (e, animalId, species) => {
    const newIntervalString = e.target.value;
    const newInterval = newIntervalString === '' ? 0 : parseInt(newIntervalString, 10);

    if (isNaN(newInterval)) {
      console.error('Invalid input: Not a number');
      return; // Exit the function if input is not a valid number
    }

    // Update local state immediately to reflect in the input field
    setAnimalData(prevData =>
      prevData.map(animal =>
        animal.id === animalId
          ? { ...animal, upload_interval: newInterval }
          : animal
      )
    );

    // Clear the previous timeout to prevent multiple updates
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to update Firebase after a short delay
    const timeoutId = setTimeout(() => {
      const pluralSpecies = species === 'Elephant' ? 'Elephants' :
        species === 'Lion' ? 'Lions' :
          species === 'Giraffe' ? 'Giraffes' :
            species === 'Rhino' ? 'Rhinos' :
              species === 'Leopard' ? 'Leopards' : species;

      // Update Firebase after the delay
      const animalRef = ref(database, `Animals/${pluralSpecies}/${animalId}`);
      update(animalRef, {
        upload_interval: newInterval
      })
        .then(() => {
          console.log("Upload interval updated successfully in Firebase");
        })
        .catch((error) => {
          console.error("Error updating upload interval in Firebase:", error);
          // Revert local state if Firebase update fails
          setAnimalData(prevData =>
            prevData.map(animal =>
              animal.id === animalId
                ? { ...animal, upload_interval: animal.upload_interval }
                : animal
            )
          );
        });
    }, 1000); // Update Firebase after 1 second delay

    setTypingTimeout(timeoutId); // Store the timeout ID
  };

  return (
    <div className="realtime-container">
      <div className="fixed-sidebar">
        <button className="sidebar-button" onClick={toggleReportMenu}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={togglePatrolMenu}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={toggleLayerMenu}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={toggleAnimalMenu}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
        <button className="sidebar-button" onClick={toggleRemoteControlMenu}>
          <img src={remoteControlIcon} alt="Remote Control" className="sidebar-icon" />
          <span>Remote<br></br>Control</span>
        </button>
      </div>

      <MapContainer className="map" center={[-1.948, 34.1665]} zoom={16} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {reportData.map(report => {
            const reportIcon = new Icon({
              iconUrl:
                report.category === 'CT_Icon_Sighting' ? CTIcon :
                  report.category === 'Fire' ? fireIcon :
                    report.category === 'Human_Wildlife_Contact' ? humanWildlifeIcon :
                      report.category === 'Injured_Animal' ? injuredAnimalIcon :
                        report.category === 'Invasive_Species_Sighting' ? invasiveSpeciesIcon :
                          report.category === 'Rainfall' ? rainfallIcon :
                            report.category === 'Rhino_Sighting' ? rhinoSightingIcon :
                              wildlifeSightingIcon, // Default icon
              iconSize: [38, 38]
            });

            return (
              <Marker
                key={report.id}
                position={[report.location.Lat, report.location.Lng]}
                icon={reportIcon}
              >
                <Popup>
                  <div style={{ padding: '0px', borderRadius: '1px' }}>
                    <strong>{report.category.replace(/_/g, ' ')}</strong><br />
                    Location: {report.location.Lat}, {report.location.Long}<br />
                    Timestamp: {report.timestamp}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {animalData.map(animal => {
            // Determine the icon based on species
            const speciesIcon = new Icon({
              iconUrl:
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
                      animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                        animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                          animalIcon, // Default icon for other species
              iconSize: [38, 38] // Adjust size as needed
            });

            return (
              <Marker
                key={animal.id} // Ensure each marker has a unique key
                position={[animal.location.Lat, animal.location.Lng]}
                icon={speciesIcon} // Use species-specific icon
              >
                <Popup>
                  <div style={{ padding: '0px', borderRadius: '1px' }}>
                    <strong>{animal.name}</strong><br />
                    Sex: {animal.sex}<br />
                    Age: {animal.age} years<br />
                    Temp: {animal.temp} °C<br />
                    Activity: {animal.activity}
                  </div>
                </Popup>

              </Marker>
            );
          })}
        </MarkerClusterGroup>
        <ZoomControl position="bottomright" />
      </MapContainer>

      <div id="layer-menu" className={`layer-menu ${isLayerMenuVisible ? 'show' : 'hide'}`}>
        <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
          <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
          Outdoors
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
          <img src={lightIcon} alt="Light" className="layer-icon" />
          Light
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
          <img src={darkIcon} alt="Dark" className="layer-icon" />
          Dark
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
          <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
          Satellite
        </button>
        <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
          <img src={threeDIcon} alt="3D" className="layer-icon" />
          3D
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/heatmap-v10')}>
          <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
          Heatmap
        </button>
      </div>

      <ReportMenu
        isReportMenuVisible={isReportMenuVisible}
        toggleReportMenu={toggleReportMenu}
        reportData={reportData}
        openModal={openModal}
      />

      <div id="patrol-menu" className={`patrol-menu ${isPatrolMenuVisible ? 'show' : 'hide'}`}>
        <div className="patrol-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Patrol Officers</span>
          <span className="close-sign" onClick={togglePatrolMenu}>x</span>
        </div>
        <div className="patrol-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="patrol-summary">
          <span>1 results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="patrol-list">
          {/* Replace with dynamic data */}
          <div className="patrol-item">
            <img src={patrolsIcon} alt="patrol" className="patrol-image" />
            <span className="entry-number">1</span>
            <span className="report-name">Elisa Kikota</span>
            <span className="report-day-time">
              <div classname="patrol-date">9th Aug 2024</div>
              <div classname="patrol-time">12:30 PM</div>
            </span>
            <button className="locate-icon">{<img src={locationIcon} alt="locationIcon" className="layer-icon" />}</button>
          </div>
          {/* Repeat for other reports */}
        </div>
      </div>

      <div id="animal-menu" className={`animal-menu ${isAnimalMenuVisible ? 'show' : 'hide'}`}>
        <div className="animal-header">
          <span className="plus-sign">+</span>
          <span className="animal-title">Animals</span>
          <span className="close-sign" onClick={() => setIsAnimalMenuVisible(false)}>x</span>
        </div>
        <div className="animal-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="animal-summary">
          <span>{animalData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="animal-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />
              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>
              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>

      </div>

      <div id="remote-control-menu" className={`remote-control-menu ${isRemoteControlMenuVisible ? 'show' : 'hide'}`}>
        <div className="remote-control-header">
          <span className="plus-sign">+</span>
          <span className="remote-control-title">Remote Control Tag</span>
          <span className="close-sign" onClick={toggleReportMenu}>x</span>
        </div>
        <div className="remote-control-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="remote-control-summary">
          <span>{reportData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="remote-control-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />

              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>

              {/* Added text box for upload interval */}
              <span className="animal-upload-interval">
                <input
                  type="number"
                  value={animal.upload_interval}
                  placeholder="Enter Interval"
                  className='interval-input'
                  onChange={(e) => handleIntervalChange(e, animal.id, animal.species)}
                />

              </span>


              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>

              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>



      {isModalOpen && (
        <ReportModal report={selectedReport} onClose={closeModal} />
      )}


    </div>
  );
}

```


### File: pages\RealtimeContents\Reports.js
```
import React, { useState, useEffect } from 'react';
import reportsIcon from '../../assets/reports.png';
import locationIcon from '../../assets/location.png';
import '../../styles/RealTime.css';

export default function ReportMenu({ isVisible, toggleReportMenu, reportData, openModal }) {
  const [sortedReports, setSortedReports] = useState([]);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    setSortedReports(reportData);
  }, [reportData]);

  const handleSort = (criteria) => {
    let sorted = [...sortedReports];
    if (criteria === 'dateUpdated') {
      sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    setSortedReports(sorted);
    setSortBy(criteria);
  };

  if (!isVisible) return null;

  return (
    <div id="report-menu" className={`report-menu ${isVisible ? 'show' : 'hide'}`}>
      <div className="report-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Reports</span>
        <span className="close-sign" onClick={toggleReportMenu}>x</span>
      </div>
      <div className="report-filters">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="filter-btn">Filters</button>
        <button className="date-btn">Dates</button>
        <button 
          className={`date-updated-btn ${sortBy === 'dateUpdated' ? 'active' : ''}`}
          onClick={() => handleSort('dateUpdated')}
        >
          Date Updated
        </button>
      </div>
      <div className="report-summary">
        <span>{sortedReports.length} results</span>
      </div>
      <div className="report-list">
        {sortedReports.map((report) => (
          <div key={report.id} className="report-item" onClick={() => openModal(report)}>
            <img src={reportsIcon} alt="Report" className="report-image" />
            <span className="entry-number">{report.id}</span>
            <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
            <span className="report-day-time">
              <div className="report-date">{new Date(report.timestamp).toLocaleDateString()}</div>
              <div className="report-time">{new Date(report.timestamp)}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="locationIcon" className="layer-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```


### File: pages\ReportMenu.js
```
import React, { useState, useMemo, useEffect } from 'react';
import '../styles/RealTime.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

import FireIcon from '../assets/Fire.png'
import HumanWildlifeContactIcon from '../assets/Human_Wildlife_Contact.png'
import InjuredAnimalIcon from '../assets/Injured_Animal.png'
import InvasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png'
import RainfallIcon from '../assets/Rainfall.png'
import RhinoSightingIcon from '../assets/Rhino_Sighting.png'
import WildlifeSightingIcon from '../assets/Wildlife_Sighting.png'
import locationIcon from '../assets/location.png'
import CTIcon from '../assets/CT_Icon_Sighting.png';

const ReportMenu = ({ isReportMenuVisible, toggleReportMenu, reportData, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [displayedReports, setDisplayedReports] = useState([]);

  const filteredAndSortedReports = useMemo(() => {
    return reportData
      .filter(report => 
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        const dateA = new Date(a.day);
        const dateB = new Date(b.day);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [reportData, searchTerm, sortOrder]);

  useEffect(() => {
    setDisplayedReports(filteredAndSortedReports.slice(0, 10));
  }, [filteredAndSortedReports]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const loadMoreReports = () => {
    setDisplayedReports(prevReports => [
      ...prevReports,
      ...filteredAndSortedReports.slice(prevReports.length, prevReports.length + 10)
    ]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset displayed reports when search term changes
    setDisplayedReports([]); 
  };

  return (
    <div id="report-menu" className={`report-menu ${isReportMenuVisible ? 'show' : 'hide'}`}>
      <div className="report-header">
        <span className="plus-sign">+</span>
        <span className="report-title">Reports</span>
        <span className="close-sign" onClick={toggleReportMenu}>x</span>
      </div>
      <div className="report-filters">
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-bar" 
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="date-updated-btn" onClick={toggleSortOrder}>
          {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          Date Updated
        </button>
      </div>
      <div className="report-summary">
        <span>{filteredAndSortedReports.length} results</span>
      </div>
      <div className="report-list">
        {displayedReports.map((report) => (
          <div
            key={report.id}
            className="report-item"
            onClick={() => openModal(report)}
          >
            <img src={getReportIcon(report.category)} alt="report" className="report-image" />
            <span className="entry-number">{report.id}</span>
            <span className="report-name">{report.category.replace(/_/g, ' ')}</span>
            <span className="report-day-time">
              <div className="report-date">{formatDate(report.day)}</div>
              <div className="report-time">{formatTime(report.time)}</div>
            </span>
            <button className="locate-icon">
              <img src={locationIcon} alt="locationIcon" className="layer-icon" />
            </button>
          </div>
        ))}
        {displayedReports.length < filteredAndSortedReports.length && (
          <button onClick={loadMoreReports} className="load-more-btn">Load More</button>
        )}
      </div>
    </div>
  );
};

const getReportIcon = (category) => {
  switch(category) {
    case 'CT_Icon_Sighting': return CTIcon;
    case 'Fire': return FireIcon;
    case 'Human_Wildlife_Contact': return HumanWildlifeContactIcon;
    case 'Injured_Animal': return InjuredAnimalIcon;
    case 'Invasive_Species_Sighting': return InvasiveSpeciesIcon;
    case 'Rainfall': return RainfallIcon;
    case 'Rhino_Sighting': return RhinoSightingIcon;
    default: return WildlifeSightingIcon;
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default ReportMenu;
```


### File: pages\Signout.js
```
import React from 'react';

function Signout() {
  return <div>Signout Page</div>;
}

export default Signout;

```


## Directory: pages\steps


### File: pages\steps\ColumnMappingStep.jsx
```
import React from 'react';
import { 
  Typography, 
  Box, 
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  HelpCircle,
  MapPin,
  Clock,
  ThermometerIcon,
  Heart,
  BarChart
} from 'lucide-react';

const ColumnMappingStep = ({ headerRow, columnMappings, setColumnMappings, previewData }) => {
  const handleColumnChange = (field, value) => {
    setColumnMappings({
      ...columnMappings,
      [field]: value
    });
  };
  
  // Column type definitions with icons and descriptions
  const columnTypes = [
    {
      id: 'latitude',
      label: 'Latitude',
      icon: <MapPin size={20} />,
      description: 'Y-coordinate; values typically between -90° and 90°',
      required: true
    },
    {
      id: 'longitude',
      label: 'Longitude',
      icon: <MapPin size={20} />,
      description: 'X-coordinate; values typically between -180° and 180°',
      required: true
    },
    {
      id: 'timestamp',
      label: 'Timestamp',
      icon: <Clock size={20} />,
      description: 'Date and time of the measurement',
      required: false
    },
    {
      id: 'temperature',
      label: 'Temperature',
      icon: <ThermometerIcon size={20} />,
      description: 'Temperature readings in celsius or fahrenheit',
      required: false
    },
    {
      id: 'heartRate',
      label: 'Heart Rate',
      icon: <Heart size={20} />,
      description: 'Heart rate/pulse in BPM',
      required: false
    },
    {
      id: 'animalId',
      label: 'Animal ID',
      icon: <BarChart size={20} />,
      description: 'Identifier for the animal being tracked',
      required: false
    },
    {
      id: 'species',
      label: 'Species',
      icon: <BarChart size={20} />,
      description: 'Animal species classification',
      required: false
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Map Columns
      </Typography>
      
      <Typography variant="body1" paragraph>
        Match your CSV columns to the required data fields. Required fields are marked with *.
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {columnTypes.map((columnType) => (
          <Grid item xs={12} md={6} key={columnType.id}>
            <Card
              variant="outlined"
              sx={{ 
                height: '100%',
                borderWidth: columnType.required ? 2 : 1,
                borderColor: columnType.required ? 'primary.main' : 'divider',
                position: 'relative'
              }}
            >
              {columnType.required && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderBottomLeftRadius: 8
                  }}
                >
                  Required
                </Box>
              )}
              <CardHeader
                avatar={<Box sx={{ color: 'primary.main' }}>{columnType.icon}</Box>}
                title={columnType.label}
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Tooltip title={columnType.description}>
                    <IconButton size="small">
                      <HelpCircle size={18} />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel id={`${columnType.id}-label`}>
                    Select Column
                  </InputLabel>
                  <Select
                    labelId={`${columnType.id}-label`}
                    value={columnMappings[columnType.id] || ''}
                    onChange={(e) => handleColumnChange(columnType.id, e.target.value)}
                    label="Select Column"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {headerRow.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {columnMappings[columnType.id] && previewData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sample values:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      maxHeight: 60,
                      overflow: 'auto',
                      bgcolor: '#f5f5f5',
                      p: 1,
                      borderRadius: 1
                    }}>
                      {previewData.slice(0, 3).map((row, i) => (
                        <Box key={i} sx={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          fontSize: '0.75rem'
                        }}>
                          {row[columnMappings[columnType.id]]}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>Column Mapping Tips</AlertTitle>
        <ul>
          <li>Latitude and longitude are required for spatial analysis</li>
          <li>If your data doesn't have timestamps, you can generate them in the next step</li>
          <li>Mapping optional fields will enable more advanced analysis options</li>
        </ul>
      </Alert>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {Object.values(columnMappings).filter(Boolean).length} of {columnTypes.length} columns mapped
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {columnTypes.filter(ct => ct.required && columnMappings[ct.id]).length} of {columnTypes.filter(ct => ct.required).length} required columns mapped
          </Typography>
        </Box>
        
        {/* Show warning if required fields are missing */}
        {columnTypes.some(ct => ct.required && !columnMappings[ct.id]) && (
          <Alert severity="warning" sx={{ maxWidth: '60%' }}>
            Please map all required columns before proceeding
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default ColumnMappingStep;
```


### File: pages\steps\PreviewAndUploadStep.jsx
```
import React from 'react';
import {
  Typography,
  Box,
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material';
import { BarChart } from 'lucide-react';

const PreviewAndUploadStep = ({ previewData, uploadStatus, uploadProgress, columnMappings }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Preview and Upload
      </Typography>
      
      <Typography variant="body1" paragraph>
        Review your processed data before uploading it to the database. 
        The following shows how your data will be stored.
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Timestamp</TableCell>
              {columnMappings.temperature && <TableCell>Temperature</TableCell>}
              {columnMappings.heartRate && <TableCell>Heart Rate</TableCell>}
              {columnMappings.animalId && <TableCell>Animal ID</TableCell>}
              {columnMappings.species && <TableCell>Species</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{rowIndex + 1}</TableCell>
                <TableCell>{row[columnMappings.latitude]}</TableCell>
                <TableCell>{row[columnMappings.longitude]}</TableCell>
                <TableCell>{row._processedTimestamp || 'Not available'}</TableCell>
                {columnMappings.temperature && <TableCell>{row[columnMappings.temperature]}</TableCell>}
                {columnMappings.heartRate && <TableCell>{row[columnMappings.heartRate]}</TableCell>}
                {columnMappings.animalId && <TableCell>{row[columnMappings.animalId]}</TableCell>}
                {columnMappings.species && <TableCell>{row[columnMappings.species]}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {uploadStatus === 'uploading' && (
        <Box sx={{ my: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading data to Firebase...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {uploadProgress}% Complete
          </Typography>
        </Box>
      )}
      
      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ my: 3 }}>
          <AlertTitle>Upload Successful!</AlertTitle>
          <Typography variant="body1" paragraph>
            Your data has been successfully uploaded to the database and is now available for analysis.
          </Typography>
          <Button variant="outlined" color="success" startIcon={<BarChart />}>
            Go to Analysis Dashboard
          </Button>
        </Alert>
      )}
      
      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ my: 3 }}>
          <AlertTitle>Upload Failed</AlertTitle>
          <Typography variant="body1">
            There was an error uploading your data. Please try again or contact support.
          </Typography>
        </Alert>
      )}
      
      {!uploadStatus && (
        <Alert severity="info" sx={{ my: 3 }}>
          <AlertTitle>Ready to Upload</AlertTitle>
          <Typography variant="body1" paragraph>
            Your data is ready to be uploaded to the Firebase database. Click the "Upload to Database" 
            button when you're ready to proceed.
          </Typography>
          <Typography variant="body2">
            <strong>Important:</strong> This process may take some time depending on the size of your dataset.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PreviewAndUploadStep;
```


### File: pages\steps\TimestampConfigStep.jsx
```
import React from 'react';
import {
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle
} from '@mui/material';
import { CalendarIcon } from 'lucide-react';

const TimestampConfigStep = ({ timestampConfig, setTimestampConfig, headerRow, columnMappings }) => {
  const handleConfigChange = (field, value) => {
    setTimestampConfig({
      ...timestampConfig,
      [field]: value
    });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Timestamps
      </Typography>
      
      <Typography variant="body1" paragraph>
        Choose how to handle time data for your analysis. This is important for temporal analysis and visualization.
      </Typography>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Timestamp Approach
        </Typography>
        
        <RadioGroup
          value={timestampConfig.format}
          onChange={(e) => handleConfigChange('format', e.target.value)}
        >
          <FormControlLabel 
            value="auto" 
            control={<Radio />} 
            label={
              <Box>
                <Typography variant="body1">Use existing timestamp column</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use data from your timestamp column
                </Typography>
              </Box>
            } 
            disabled={!columnMappings.timestamp}
          />
          
          <FormControlLabel 
            value="custom" 
            control={<Radio />} 
            label={
              <Box>
                <Typography variant="body1">Configure from date/time columns</Typography>
                <Typography variant="body2" color="text.secondary">
                  Combine separate date and time columns
                </Typography>
              </Box>
            }
          />
          
          <FormControlLabel 
            value="interval" 
            control={<Radio />} 
            label={
              <Box>
                <Typography variant="body1">Generate timestamps at regular intervals</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use a start time and regular interval between readings
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Paper>
      
      {/* Conditional configuration blocks based on selected approach */}
      {timestampConfig.format === 'auto' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Using Timestamp Column: <strong>{columnMappings.timestamp || 'None selected'}</strong>
          </Typography>
          
          {!columnMappings.timestamp && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You need to select a timestamp column in the previous step, or choose a different approach.
            </Alert>
          )}
        </Paper>
      )}
      
      {timestampConfig.format === 'custom' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Date and Time Columns
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timestampConfig.hasDate} 
                    onChange={(e) => handleConfigChange('hasDate', e.target.checked)}
                  />
                }
                label="Include date"
              />
              
              {timestampConfig.hasDate && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Date Column</InputLabel>
                    <Select
                      value={timestampConfig.dateColumn}
                      onChange={(e) => handleConfigChange('dateColumn', e.target.value)}
                      label="Date Column"
                    >
                      <MenuItem value="">
                        <em>Use default date</em>
                      </MenuItem>
                      {headerRow.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {!timestampConfig.dateColumn && (
                    <TextField
                      label="Default Date"
                      type="date"
                      value={timestampConfig.startDate}
                      onChange={(e) => handleConfigChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                    />
                  )}
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={timestampConfig.hasTime} 
                    onChange={(e) => handleConfigChange('hasTime', e.target.checked)}
                  />
                }
                label="Include time"
              />
              
              {timestampConfig.hasTime && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Time Column</InputLabel>
                    <Select
                      value={timestampConfig.timeColumn}
                      onChange={(e) => handleConfigChange('timeColumn', e.target.value)}
                      label="Time Column"
                    >
                      <MenuItem value="">
                        <em>Use default time</em>
                      </MenuItem>
                      {headerRow.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {!timestampConfig.timeColumn && (
                    <TextField
                      label="Default Time"
                      type="time"
                      value={timestampConfig.startTime}
                      onChange={(e) => handleConfigChange('startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                      fullWidth
                      margin="normal"
                    />
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {timestampConfig.format === 'interval' && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Generate Timestamps at Regular Intervals
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={timestampConfig.startDate}
                onChange={(e) => handleConfigChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                type="time"
                value={timestampConfig.startTime}
                onChange={(e) => handleConfigChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Time between readings:
                </Typography>
                <TextField
                  type="number"
                  value={timestampConfig.interval}
                  onChange={(e) => handleConfigChange('interval', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  minutes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Alert severity="info">
        <AlertTitle>Timestamp Information</AlertTitle>
        <Typography variant="body2" paragraph>
          Properly configured timestamps allow for:
        </Typography>
        <ul>
          <li>Temporal analysis and trends over time</li>
          <li>Visualization of movement patterns</li>
          <li>Correlation with environmental factors</li>
          <li>Seasonal behavior analysis</li>
        </ul>
      </Alert>
    </Box>
  );
};

export default TimestampConfigStep;
```


### File: pages\steps\UploadCompleteStep.jsx
```
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Button
} from '@mui/material';
import { CheckCircle } from 'lucide-react';

const UploadCompleteStep = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle size={80} color="#4caf50" />
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
        Upload Complete!
      </Typography>
      <Typography variant="body1" paragraph>
        Your data has been successfully uploaded and processed.
        You can now use it for analysis and visualization.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained"
          color="primary"
          component={Link}
          to="/analysis_dashboard"
          sx={{ mr: 2 }}
        >
          Go to Analysis Dashboard
        </Button>
        <Button variant="outlined">
          Upload Another File
        </Button>
      </Box>
    </Box>
  );
};

export default UploadCompleteStep;
```


### File: pages\steps\UploadStep.jsx
```
import React from 'react';
import { 
  Typography, 
  Box, 
  Button,
  CircularProgress
} from '@mui/material';
import { Upload } from 'lucide-react';

const UploadStep = ({ selectedFile, handleFileUpload, isValidating }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload CSV File
      </Typography>
      
      <Typography variant="body1" paragraph>
        Upload a CSV file containing geodata (latitude/longitude) and optionally temperature, 
        heart rate, and timestamp information.
      </Typography>
      
      <Box sx={{ 
        border: '2px dashed #ccc', 
        borderRadius: 2, 
        p: 4, 
        textAlign: 'center',
        mb: 3,
        backgroundColor: '#f9f9f9',
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: '#1976d2',
          backgroundColor: '#f0f7ff'
        }
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
            variant="contained"
            component="span"
            startIcon={<Upload />}
            sx={{ mb: 2 }}
            size="large"
          >
            Choose CSV File
          </Button>
        </label>
        
        <Typography variant="body2" color="textSecondary">
          {selectedFile ? `Selected: ${selectedFile.name}` : 'Supported format: CSV'}
        </Typography>
      </Box>
      
      {isValidating && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography color="primary" display="inline">
            Reading and parsing file...
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Requirements:
        </Typography>
        <ul>
          <li>File must be in CSV format</li>
          <li>Must contain latitude and longitude columns</li>
          <li>Timestamps can be provided or generated during import</li>
          <li>Optional columns: temperature, heart rate, animal ID, species</li>
        </ul>
      </Box>
    </Box>
  );
};

export default UploadStep;
```


### File: pages\steps\ValidateStep.jsx
```
import React from 'react';
import { 
  Typography, 
  Box, 
  Alert,
  AlertTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const ValidateStep = ({ headerRow, validationErrors, validationWarnings, previewData }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Data Validation
      </Typography>
      
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Errors Found</AlertTitle>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warnings</AlertTitle>
          <Typography variant="body2" paragraph>
            These warnings won't prevent you from proceeding, but you may want to check the data.
          </Typography>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', paddingLeft: 0 }}>
            {validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {validationErrors.length === 0 && validationWarnings.length === 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Validation Successful</AlertTitle>
          Your data looks good! You can proceed to the next step.
        </Alert>
      )}
      
      <Typography variant="subtitle1" gutterBottom>
        Available Columns:
      </Typography>
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {headerRow.map((header, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 1,
              bgcolor: '#f5f5f5',
              display: 'inline-block'
            }}
          >
            {header}
          </Box>
        ))}
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Data Preview:
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {headerRow.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{rowIndex + 1}</TableCell>
                {headerRow.map((header, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ValidateStep;
```


## Directory: pages\utils


### File: pages\utils\dataProcessingUtils.js
```
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
```


### File: pages\ViewAnimals.js
```
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import { Search, Edit, Delete, Add, Map as MapIcon } from '@mui/icons-material';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '../firebase'; // Adjust the import path as needed
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import PieChart from './PieChart'; // Adjust the import path as needed
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import animal icons
import elephantIcon from '../assets/elephant.png';
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';

function ViewAnimals() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animalStats, setAnimalStats] = useState({ total: 0, species: {} });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const animalsRef = ref(database, 'Animals');
    onValue(animalsRef, (snapshot) => {
      const data = snapshot.val();
      const animalList = data ? Object.entries(data).flatMap(([species, animals]) => 
        Object.entries(animals).map(([id, animal]) => ({
          id,
          species,
          ...animal,
          location: animal.location ? Object.values(animal.location).pop() : null
        }))
      ) : [];
      setAnimals(animalList);
      setFilteredAnimals(animalList);
      updateAnimalStats(animalList);
    });
  }, []);

  useEffect(() => {
    const filtered = animals.filter(animal => 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (speciesFilter === '' || animal.species === speciesFilter)
    );
    setFilteredAnimals(filtered);
  }, [searchTerm, speciesFilter, animals]);

  const updateAnimalStats = (animalList) => {
    const stats = { total: animalList.length, species: {} };
    animalList.forEach(animal => {
      if (stats.species[animal.species]) {
        stats.species[animal.species]++;
      } else {
        stats.species[animal.species] = 1;
      }
    });
    setAnimalStats(stats);
  };

  const handleOpenDialog = (animal = null) => {
    setSelectedAnimal(animal);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnimal(null);
  };

  const handleSaveAnimal = (animalData) => {
    if (selectedAnimal) {
      update(ref(database, `Animals/${animalData.species}/${selectedAnimal.id}`), animalData);
    } else {
      // const newAnimalRef = ref(database, `Animals/${animalData.species}`);
      // const newAnimal = set(newAnimalRef, animalData);
    }
    handleCloseDialog();
  };

  const handleDeleteAnimal = (animalId, species) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      remove(ref(database, `Animals/${species}/${animalId}`));
    }
  };

  const getAnimalIcon = (species) => {
    const iconUrl = species === 'Elephants' ? elephantIcon :
                    species === 'Lions' ? lionIcon :
                    species === 'Giraffes' ? giraffeIcon :
                    species === 'Rhinos' ? rhinoIcon :
                    species === 'Leopards' ? leopardIcon : null;
    
    return iconUrl ? new L.Icon({
      iconUrl,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    }) : new L.Icon.Default();
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Animal Management
      </Typography>
      
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Chip label={`Total Animals: ${animalStats.total}`} color="primary" />
          {Object.entries(animalStats.species).map(([species, count]) => (
            <Chip key={species} label={`${species}: ${count}`} style={{ marginLeft: 8 }} />
          ))}
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Animal
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16, height: 300 }}>
            {animalStats.species && Object.keys(animalStats.species).length > 0 && (
              <PieChart data={animalStats.species} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Last Known Locations</Typography>
            <Button startIcon={<MapIcon />} onClick={() => setShowMap(!showMap)}>
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            {showMap && (
              <MapContainer center={[-1.948, 34.1665]} zoom={8} style={{ height: '300px', marginTop: 16 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredAnimals.map(animal => (
                  animal.location && (
                    <Marker 
                      key={animal.id} 
                      position={[animal.location.Lat, animal.location.Lng]}
                      icon={getAnimalIcon(animal.species)}
                    >
                      <Popup>
                        <strong>{animal.name}</strong><br />
                        Species: {animal.species}<br />
                        Last seen: {new Date(animal.location.timestamp).toLocaleString()}
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" mb={3}>
        <TextField
          label="Search Animals"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search />
          }}
          style={{ marginRight: 16, flexGrow: 1 }}
        />
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            label="Species"
          >
            <MenuItem value="">All</MenuItem>
            {Object.keys(animalStats.species).map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Sex</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAnimals.map((animal) => (
              <TableRow key={animal.id}>
                <TableCell>{animal.name}</TableCell>
                <TableCell>{animal.species}</TableCell>
                <TableCell>{animal.age}</TableCell>
                <TableCell>{animal.sex}</TableCell>
                <TableCell>
                  {animal.location ? new Date(animal.location.timestamp).toLocaleString() : 'Unknown'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(animal)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteAnimal(animal.id, animal.species)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AnimalDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveAnimal}
        animal={selectedAnimal}
      />
    </Container>
  );
}

function AnimalDialog({ open, onClose, onSave, animal }) {
  const [animalData, setAnimalData] = useState({
    name: '',
    species: '',
    age: '',
    sex: '',
    upload_interval: 60
  });

  useEffect(() => {
    if (animal) {
      setAnimalData(animal);
    } else {
      setAnimalData({
        name: '',
        species: '',
        age: '',
        sex: '',
        upload_interval: 60
      });
    }
  }, [animal]);

  const handleChange = (e) => {
    setAnimalData({ ...animalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(animalData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{animal ? 'Edit Animal' : 'Add New Animal'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          value={animalData.name}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Species</InputLabel>
          <Select
            name="species"
            value={animalData.species}
            onChange={handleChange}
          >
            <MenuItem value="Elephants">Elephants</MenuItem>
            <MenuItem value="Lions">Lions</MenuItem>
            <MenuItem value="Giraffes">Giraffes</MenuItem>
            <MenuItem value="Rhinos">Rhinos</MenuItem>
            <MenuItem value="Leopards">Leopards</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="age"
          label="Age"
          type="number"
          fullWidth
          value={animalData.age}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Sex</InputLabel>
          <Select
            name="sex"
            value={animalData.sex}
            onChange={handleChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="upload_interval"
          label="Upload Interval (minutes)"
          type="number"
          fullWidth
          value={animalData.upload_interval}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewAnimals;
```


### File: pages\ViewUsers.js
```
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, Box, Chip, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Search, Edit, Delete, Add } from '@mui/icons-material';
import { ref, onValue, remove, update, set, get } from 'firebase/database';
import { database } from '../firebase'; // Adjust the import path as needed

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, admins: 0 });

  useEffect(() => {
    const usersRef = ref(database, 'Users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
      setUsers(userList);
      setFilteredUsers(userList);
      updateUserStats(userList);
    });
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (roleFilter === '' || user.role === roleFilter)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const updateUserStats = (userList) => {
    setUserStats({
      total: userList.length,
      active: userList.filter(user => user.status === 'active').length,
      admins: userList.filter(user => user.role === 'admin').length
    });
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    if (selectedUser) {
      // Update existing user
      await update(ref(database, `Users/${selectedUser.id}`), userData);
    } else {
      // Add new user
      const nextIndex = await getNextUserIndex();
      await set(ref(database, `Users/${nextIndex}`), userData);
    }
    handleCloseDialog();
  };

  const getNextUserIndex = async () => {
    const usersRef = ref(database, 'Users');
    const snapshot = await get(usersRef);
    const data = snapshot.val();
    if (!data) return "1";
    const keys = Object.keys(data);
    const maxIndex = Math.max(...keys.map(Number));
    return (maxIndex + 1).toString();
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await remove(ref(database, `Users/${userId}`));
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Chip label={`Total Users: ${userStats.total}`} color="primary" />
          <Chip label={`Active Users: ${userStats.active}`} color="success" style={{ marginLeft: 8 }} />
          <Chip label={`Admins: ${userStats.admins}`} color="secondary" style={{ marginLeft: 8 }} />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New User
        </Button>
      </Box>

      <Box display="flex" mb={3}>
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search />
          }}
          style={{ marginRight: 16, flexGrow: 1 }}
        />
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar src={user.avatar} alt={user.name} style={{ marginRight: 8 }} />
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UserDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </Container>
  );
}


function UserDialog({ open, onClose, onSave, user }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    avatar: ''
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(userData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          value={userData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email Address"
          type="email"
          fullWidth
          value={userData.email}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={userData.role}
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={userData.status}
            onChange={handleChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="avatar"
          label="Avatar URL"
          type="text"
          fullWidth
          value={userData.avatar}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewUsers;
```


### File: pages\Welcome.js
```
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const Welcome = () => {
  const [stats, setStats] = useState({
    animalsTracked: 0,
    speciesCovered: 0,
    patrolOfficers: 0
  });

  useEffect(() => {
    const animalsRef = ref(database, 'Animals');
    const patrolOfficersRef = ref(database, 'PatrolOfficers');

    const fetchData = async () => {
      try {
        const animalsSnapshot = await new Promise((resolve, reject) => {
          onValue(animalsRef, resolve, reject);
        });

        const patrolOfficersSnapshot = await new Promise((resolve, reject) => {
          onValue(patrolOfficersRef, resolve, reject);
        });

        const animalsData = animalsSnapshot.val();
        const patrolOfficersData = patrolOfficersSnapshot.val();

        let totalAnimals = 0;
        const species = new Set();

        if (animalsData) {
          Object.keys(animalsData).forEach(speciesKey => {
            species.add(speciesKey);
            const speciesData = animalsData[speciesKey];
            totalAnimals += Object.keys(speciesData).length;
          });
        }

        const patrolOfficersCount = patrolOfficersData ? Object.keys(patrolOfficersData).length : 0;

        setStats({
          animalsTracked: totalAnimals,
          speciesCovered: species.size,
          patrolOfficers: patrolOfficersCount
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-full w-full" style={{ 
      background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 50%, #bbdefb 100%)',
      minHeight: '100vh',
      color: 'white',
      textAlign: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <Container 
        maxWidth='lg' 
        className="h-full"
        sx={{
          ml: '70px', // Compensate for sidebar width
          width: 'calc(100% - 70px)', // Adjust total width
          px: 3 // Add equal padding on both sides
        }}
      >
        <Box my={1}>
          <Typography variant="h2" component="h1" gutterBottom style={{ color: 'white' }}>
            Welcome to AI-Powered Animal Tracking System
          </Typography>
          <Typography variant="h5" component="p" gutterBottom style={{ color: 'white' }}>
            Efficient and reliable tracking of wildlife and domestic animals.
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/real_time" style={{ margin: '20px' }}>
            Start Tracking
          </Button>
        </Box>

        <Box my={4}>
          <Typography variant="h4" component="h2" gutterBottom style={{ color: 'white' }}>
            Statistics
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <Typography variant="h2" component="p" style={{ color: 'white' }}>
                  {stats.animalsTracked.toLocaleString()}
                </Typography>
                <Typography component="p" style={{ color: 'white' }}>
                  Animals Tracked
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <Typography variant="h2" component="p" style={{ color: 'white' }}>
                  {stats.speciesCovered.toLocaleString()}
                </Typography>
                <Typography component="p" style={{ color: 'white' }}>
                  Species Covered
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <Typography variant="h2" component="p" style={{ color: 'white' }}>
                  {stats.patrolOfficers.toLocaleString()}
                </Typography>
                <Typography component="p" style={{ color: 'white' }}>
                  Patrol Officers
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box my={4}>
          <Typography variant="h4" component="h2" gutterBottom style={{ color: 'white' }}>
            Success Stories
          </Typography>
          <Box display="flex" justifyContent="center">
            <Paper elevation={3} style={{ padding: '20px', width: '80%', backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <Typography component="p" style={{ color: 'white' }}>
                "Using the Animal Tracking system has revolutionized how we monitor wildlife. The real-time data and analytics have been invaluable."
              </Typography>
              <Typography variant="h6" component="p" style={{ color: 'white' }}>
                - Jane Doe, Wildlife Researcher
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Welcome;
```


### File: reportWebVitals.js
```
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

```


### File: server.js
```
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: '', // replace with your MySQL password
  database: 'animal_tracking'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/api/animals', (req, res) => {
  const query = `SELECT a.id, a.name, a.species, a.icon, l.timestamp, l.lat, l.lng
                 FROM animals a
                 JOIN locations l ON a.id = l.animal_id
                 ORDER BY l.timestamp`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

```


### File: setupTests.js
```
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

```


## Directory: styles


### File: styles\PageTransition.js
```
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './Transitions.css';

const PageTransition = ({ children, location }) => (
  <TransitionGroup>
    <CSSTransition
      key={location.key}
      timeout={{ enter: 300, exit: 300 }}
      classNames="page"
    >
      {children}
    </CSSTransition>
  </TransitionGroup>
);

export default PageTransition;

```


### File: styles\RealTime.css
```
.realtime-container {
  display: flex;
  /* top: 64px; */
  position: relative;
  margin-top: 0px;
  height: calc(100vh - 64px);
  margin-left: 60px; 
  width: calc(100vw - 60px);
  overflow:hidden; 
  /* Prevent scrolling */
  }

  .sidebar-wrapper {
    display: flex;
    height: 100%;
  }

  #map {
    flex: 1;
    height: 100vh;
    z-index:0;
    width: 100%;
    height: 100%;
}

.new-sidebar {
  width: 200px; /* Adjust based on your new sidebar width */
  background-color: #f0f0f0; /* Adjust color as needed */
  height: 100%;
  overflow-y: auto;
}

.map {
  flex: 1;
  width: 100%;
  height: 100%;
  z-index:0;
  margin-left: 0px;
  overflow: hidden;
}

.leaflet-control-zoom {
  display: none !important;
}

.leaflet-control-container .leaflet-top,
.leaflet-control-container .leaflet-bottom {
  display: none !important;
}


.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgba(31, 118, 206, 0.6) !important;
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(31, 118, 206, 0.8) !important;
  color: white !important;
}


.location-toggle-container {
  position: fixed;
  top: 74px; /* 64px navbar + 10px spacing */
  right: 10px;
  z-index: 1000;
  background-color: rgba(31, 118, 206, 0.6);
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}


.fixed-sidebar {
  position:absolute;
  top: 0;
  left: 0;
  height: calc(100vh - 64px);
  width: 70px;
  background-color: rgba(31, 118, 206, 0.6);
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 1000; /* Ensure sidebar is above map controls */
}

.sidebar-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  transition: color 0.2s, background-color 0.2s;
  padding: 8px 0;
  border-left: 3px solid transparent;
}

.report-menu,
.patrol-menu,
.animal-menu,
.remote-control-menu,
.layer-menu {
  position: absolute;
  top: 10px; /* Add small spacing from top */
  left: 80px; /* Account for sidebar width + spacing */
}

.sidebar-button:hover {
  background-color: rgba(21, 126, 231, 0.5);
  color: white;
}

.sidebar-button.active {
  background-color: rgba(21, 126, 231, 0.7);
  color: white;
  border-left: 3px solid white;
}

.sidebar-button.active .sidebar-icon {
  filter: brightness(1.2);
}

.sidebar-button.active span {
  font-weight: 500;
}

.sidebar-button .sidebar-icon {
  display: block;
  width: 35px;
  height: 35px;
  margin-bottom: 5px;
}

.btn{
  display: flex;
  align-items: center;
  gap:5px;
}
.layer-menu {
  display: none;
  width: 110px;
  background-color: rgba(0, 0, 0, 0.7);
  position: absolute;
  top: 10px;
  left: 80px;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content:space-around; /* Center items vertically */
  align-items: flex-start; /* Align items to the start horizontally */
  gap: 4px;
}

.layer-menu.img {
padding-right: 10px;
}

.layer-menu.show {
  display:block;
  animation: fadeIn 0.3s forwards;
}

.layer-menu.hide {
  animation: fadeOut 0.3s forwards;
}

.layer-menu button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px 10px;
}

.layer-icon {
  width: 30px;
  height: 30px;
  margin-right: 1px;
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}




.report-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 390px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.patrol-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 390px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.animal-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 390px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.remote-control-menu {
  display: none;
  position: absolute;
  top: 10px;
  left: 80px;
  /* bottom: 0px; */
  width: 400px;
  background-color: #FDFDFD;
  padding: 0px;
  border-radius: 20px;
  color: rgb(0, 0, 0);
  z-index: 10;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.report-menu.show {
  display: block;
}

.patrol-menu.show {
  display: block;
}

.animal-menu.show {
  display: block;
}

.remote-control-menu.show {
  display: block;
}

.report-header, .report-filters, .report-summary, .report-list {
  margin-bottom: 15px;
}

.patrol-header, .patrol-filters, .patrol-summary, .report-list {
  margin-bottom: 15px;
}

.animal-header, .animal-filters, .animal-summary, .animal-list {
  margin-bottom: 15px;
}

.remote-control-header, .remote-control-filters, .remote-control-summary, .remote-control-list {
  margin-bottom: 15px;
}

.report-time{
  align-items: center;
}
.report-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.patrol-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.animal-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.remote-control-header {
  color: rgb(255, 255, 255);
  background-color: #1F76CE;
  display: flex;
  padding:8px;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
}

.plus-sign {
  font-size: 24px;
}

.report-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.patrol-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.animal-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.remote-control-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.close-sign {
  cursor: pointer;
}

.report-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patrol-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.animal-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remote-control-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  width: 40%;
  padding: 5px;
  margin: 4px;
  /* border-radius: 8px; */
}

.filter-btn, .date-btn, .date-updated-btn {
  background-color: #F2F2F4;
  border: none;
  padding: 5px;
  margin: 4px;
  cursor: pointer;
  color: #000000
  
}

.report-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.patrol-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.animal-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.remote-control-summary {
  border-top: 1px solid #61666b62;
  padding: 10px;
  padding-bottom: 0px;
  font-size: 14px;
}

.report-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.patrol-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.animal-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.remote-control-list {
  /* max-height: 200px; */
  overflow-y: auto;
}

.report-item {
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.patrol-item {
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.animal-item {
  /* top:100; */
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.remote-control-item {
  /* top:100; */
  background-color: #1f76ce41;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.report-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.patrol-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.animal-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.remote-control-image {
  background-color: #1F76CE;
  width: 30px;
  height: 30px;
  padding:8px;
  margin-right: 10px;
}

.entry-number{
  /* margin-right: 10px; */
  width:15%;
  /* background-color: #CACCCE; */
}

.report-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.patrol-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.animal-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.remote-control-name{
  /* margin-right: 10px; */
  width:50%;
  /* background-color: #CACCCE; */
}

.report-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.patrol-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.animal-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.remote-control-day-time {
  align-items: center;
  width:20%;
  font-size: 11px;
  /* margin-right: 10px; */
  /* background-color: #CACCCE; */
}

.locate-icon {
  cursor: pointer;
  background: none;
  border: none;
  color: rgb(255, 255, 255);
}

.leaflet-container{
  height:100vh;
}

.leaflet-bottom.leaflet-right{
  height:0;
}

.leaflet-left{
  /* left:0; */
  right:10;
}

.leaflet-control-zoom.leaflet-bar.leaflet-control{
  /* margin-left:0; */
  right:10;
}

/* sizing of map container*/
.leaflet-container{
  height:100vh;
}

.cluster-icon{
  height: 3rem;
  width: 3rem;
  border-radius: 50%;
  background-color: white;
  transform: translate(-25%,-25%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 900;
  font-size: 1.5rem;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  margin-left:540px;
  margin-top:74px;
  background-color: #fefefe;
  /* margin: 15% auto; */
  padding: 20px;
  border: 1px solid #888;
  width:fit-content;
  border-radius: 20px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.attached-image {
  width: 100px;
  margin-right: 10px;
}

.interval-input {
  width: 34px;
  margin-left: 0px;
  margin-right:10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

```


### File: styles\Transitions.css
```
/* For upward transitions */
.page-up-enter {
  opacity: 0;
  transform: translateY(100%);
}
.page-up-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
.page-up-exit {
  opacity: 1;
  transform: translateY(0);
}
.page-up-exit-active {
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 300ms, transform 300ms;
}

/* For downward transitions */
.page-down-enter {
  opacity: 0;
  transform: translateY(-100%);
}
.page-down-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
.page-down-exit {
  opacity: 1;
  transform: translateY(0);
}
.page-down-exit-active {
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 300ms, transform 300ms;
}

```


### File: styles\Welcome.css
```
/* Ensure the entire container fills the viewport */
.welcome-container {
  background: url('../assets/background.jpeg') no-repeat center center fixed;
  background-size: cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.welcome-content {
  background: rgba(0, 0, 0, 0.5); /* Optional: adds a dark overlay for better text visibility */
  /* padding: 20px; */
  border-radius: 10px;
}

.features {
  display: flex;
  justify-content: space-around;
  margin-top: 0px;
}

.feature {
  width: 200px;
  text-align: center;
}

.feature img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

```


## Directory: utils


# Directory: public


## Directory: data


### File: index.html
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>Animal Tracking</title>
    <link rel="icon" href="%PUBLIC_URL%/logo.png"> 
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

```


### File: manifest.json
```
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```


### File: robots.txt
```
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```


### File: _redirects
```
/* /index.html 200
```


# File: package.json
```
{
  "name": "animal-tracking",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.13.3",
    "@emotion/styled": "^11.13.0",
    "@mui/icons-material": "^5.16.7",
    "@mui/material": "^5.16.7",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.7.2",
    "chart.js": "^4.4.4",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "firebase": "^10.13.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.441.0",
    "mapbox-gl": "^3.6.0",
    "mongodb": "^6.8.0",
    "mongoose": "^8.5.1",
    "mysql2": "^3.11.0",
    "papaparse": "^5.5.2",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "react-leaflet-cluster": "^2.1.0",
    "react-map-gl": "^7.1.7",
    "react-router-dom": "^6.26.1",
    "react-scripts": "^5.0.1",
    "react-transition-group": "^4.4.5",
    "socket.io-client": "^4.7.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx}",
    "lint:fix": "eslint src/**/*.{js,jsx} --fix"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11"
  }
}

```

