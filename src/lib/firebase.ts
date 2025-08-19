
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  projectId: 'mkenya-skilled',
  appId: '1:971829599240:web:743a5618282680bb9dc5bd',
  storageBucket: 'mkenya-skilled.firebasestorage.app',
  apiKey: 'AIzaSyBe1wU8Q-415auhlXf9k7ZXefvLX9TPOF0',
  authDomain: 'mkenya-skilled.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '971829599240',
  databaseURL: 'https://mkenya-skilled-default-rtdb.firebaseio.com/',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
