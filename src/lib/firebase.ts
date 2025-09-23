
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';

const firebaseConfig = {
  apiKey: "AIzaSyBeiC1fLWb-zoh_lSS1j-qal8f3LX5VelM",
  authDomain: "mkenya-skilled.firebaseapp.com",
  databaseURL: "https://mkenya-skilled-default-rtdb.firebaseio.com",
  projectId: "mkenya-skilled",
  storageBucket: "mkenya-skilled.appspot.com",
  messagingSenderId: "971829599240",
  appId: "1:971829599240:web:c7ae181183e385219dc5bd",
};

// Initialize Firebase using a singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
let remoteConfig: any = null;

if (typeof window !== 'undefined') {
    // This condition will be true for client-side code.
    if (location.hostname === 'localhost' || location.hostname.endsWith('cloudworkstations.dev')) {
        // Connect to emulators if running locally or in Cloud Workstation
        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
            connectDatabaseEmulator(db, "127.0.0.1", 9000);
            connectStorageEmulator(storage, "127.0.0.1", 9199);
        } catch (e) {
            console.warn("Could not connect to Firebase emulators. This is expected in production.", e);
        }
    }
    
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    remoteConfig.defaultConfig = {
        "hero_title": "Unlock Your Potential.",
        "hero_subtitle": "Quality, affordable courses designed for the Kenyan market."
    };
}


export { app, auth, db, storage, remoteConfig };
