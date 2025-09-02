// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEqSqCcOYvARsKyYj9rJRYOs3oBuLUIRA",
  authDomain: "it-ticket-system-f57b2.firebaseapp.com",
  projectId: "it-ticket-system-f57b2",
  storageBucket: "it-ticket-system-f57b2.firebasestorage.app",
  messagingSenderId: "184606115765",
  appId: "1:184606115765:web:90e2f0eebf75fe87467bfc",
  measurementId: "G-D8XYW86F4D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
