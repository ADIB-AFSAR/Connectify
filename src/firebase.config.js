// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "conectify-project.firebaseapp.com",
  projectId: "conectify-project",
  storageBucket: "conectify-project.appspot.com",
  messagingSenderId: "82518232801",
  appId: "1:82518232801:web:ee3125fbf4438b67a471a0",
  measurementId: "G-F5HMYJ7G1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Firestore database
const auth = getAuth(app);      // Authentication
const provider = new GoogleAuthProvider();

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export {storage ,  auth, provider, signInWithPopup };
export default db
