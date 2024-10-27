// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVjIMX6iLFYYNF3AtK9WlZkguyXfXwR80",
  authDomain: "thoughts-e1640.firebaseapp.com",
  projectId: "thoughts-e1640",
  storageBucket: "thoughts-e1640.appspot.com",
  messagingSenderId: "297355156510",
  appId: "1:297355156510:web:afe0a20c6cea6e8bf8620f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
