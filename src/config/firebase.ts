import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAf90mBKGkMfe9J6EOpUvDummRheDm3EVo",
    authDomain: "autoshorts-c5df3.firebaseapp.com",
    projectId: "autoshorts-c5df3",
    storageBucket: "autoshorts-c5df3.firebasestorage.app",
    messagingSenderId: "1007615075964",
    appId: "1:1007615075964:web:0ff37c6dec625351998bf9",
    measurementId: "G-1VXNM9M6D8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
