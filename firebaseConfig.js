// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlKME3ahr6yKO7n7WRLVlmfnf3JWBbnqs",
  authDomain: "myproductapp-6f351.firebaseapp.com",
  projectId: "myproductapp-6f351",
  storageBucket: "myproductapp-6f351.firebasestorage.app",
  messagingSenderId: "701786949810",
  appId: "1:701786949810:web:cc7fb334ca1ce0415961ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);