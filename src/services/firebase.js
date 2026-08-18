import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGhfSWCM_t9zdmV2l8w-pMjthSwb7Qv0w",
  authDomain: "english-teacher-hub-edb82.firebaseapp.com",
  projectId: "english-teacher-hub-edb82",
  storageBucket: "english-teacher-hub-edb82.firebasestorage.app",
  messagingSenderId: "127773014283",
  appId: "1:127773014283:web:b272899a195e7739694a0e",
  measurementId: "G-7M0CXZYZLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
