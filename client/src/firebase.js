import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// PASTE YOUR CONFIG HERE
const firebaseConfig = {
    apiKey: "AIzaSyC-zBqyqBz-LSkKM9dn1au5q2ocx4IsO9w",
  authDomain: "codeecampus.firebaseapp.com",
  projectId: "codeecampus",
  storageBucket: "codeecampus.firebasestorage.app",
  messagingSenderId: "137378833974",
  appId: "1:137378833974:web:50ee2a0697ffd6c1b81a97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };