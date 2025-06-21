// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKuPTEzM3_bHDNNSh3kDlTwMoD7Ptw18U",
  authDomain: "lifeline-a5f93.firebaseapp.com",
  projectId: "lifeline-a5f93",
  storageBucket: "lifeline-a5f93.appspot.com",
  messagingSenderId: "166159060190",
  appId: "1:166159060190:web:7aa40816268a9fae7d1dd4",
  measurementId: "G-1J6N31Y04P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
