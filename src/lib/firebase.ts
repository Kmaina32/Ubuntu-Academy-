
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBe1wU8Q-415auhlXf9k7ZXefvLX9TPOF0",
  authDomain: "mkenya-skilled.firebaseapp.com",
  databaseURL: "https://mkenya-skilled-default-rtdb.firebaseio.com",
  projectId: "mkenya-skilled",
  storageBucket: "mkenya-skilled.appspot.com",
  messagingSenderId: "971829599240",
  appId: "1:971829599240:web:743a5618282680bb9dc5bd",
  measurementId: "G-MEASUREMENT_ID",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
