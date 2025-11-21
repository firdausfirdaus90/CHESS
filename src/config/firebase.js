import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnkTsk5EVAN-lAAoLhxMeENBwnIZXFGu4",
  authDomain: "chess-game-e70b8.firebaseapp.com",
  projectId: "chess-game-e70b8",
  storageBucket: "chess-game-e70b8.firebasestorage.app",
  messagingSenderId: "821282724984",
  appId: "1:821282724984:web:e69858aca4bbcc83bde18d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
