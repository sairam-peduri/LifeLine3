// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKuPTEzM3_bHDNNSh3kDlTwMoD7Ptw18U",
  authDomain: "lifeline-a5f93.firebaseapp.com",
  projectId: "lifeline-a5f93",
  storageBucket: "lifeline-a5f93.firebasestorage.app",
  messagingSenderId: "502261778085",
  appId: "1:502261778085:web:20ae1ef94b647a7e692f4c",
  measurementId: "G-S75FX074WT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };
