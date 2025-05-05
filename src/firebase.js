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
  measurementId: "G-7MQ80W5KXT",
  databaseURL: "https://animal-tracking-01-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { database };