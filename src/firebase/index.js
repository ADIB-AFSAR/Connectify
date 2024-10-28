// Import necessary functions from Firebase SDK
import { initializeApp } from "firebase/app"; // Firebase initialization
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Auth services
import { getFirestore } from "firebase/firestore"; // Firestore service
import { getStorage } from "firebase/storage"; // Storage service
import {firebaseConfig} from "../firebase.config"; // Your Firebase configuration

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Initialize Auth
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// Initialize Storage
const storage = getStorage(firebaseApp);

// Export services
export { auth, provider, storage };
export default db;
