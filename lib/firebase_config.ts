import { initializeApp , getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV5CV78MZqB_d-8GiqrGjQwEMSx9eGPv0",
  authDomain: "manage-task-project-52133.firebaseapp.com",
  projectId: "manage-task-project-52133",
  storageBucket: "manage-task-project-52133.firebasestorage.app",
  messagingSenderId: "289231180649",
  appId: "1:289231180649:web:eaf085fd4a506cab1f63f8"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseDB = getFirestore(app);