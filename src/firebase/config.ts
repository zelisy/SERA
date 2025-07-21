// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyb1vfAXDIIYjIUW8HZS1gFJxEu0kqcWw",
  authDomain: "sera-7887c.firebaseapp.com",
  projectId: "sera-7887c",
  storageBucket: "sera-7887c.firebasestorage.app",
  messagingSenderId: "174591018926",
  appId: "1:174591018926:web:288a1bf7e4e696f8712a3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);