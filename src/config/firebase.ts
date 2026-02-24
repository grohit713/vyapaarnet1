import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDLvzsuODrbFVt-9iVu9gQ6C7XK4wYx0Vg",
    authDomain: "vyapaarnet-d7ea1.firebaseapp.com",
    projectId: "vyapaarnet-d7ea1",
    storageBucket: "vyapaarnet-d7ea1.firebasestorage.app",
    messagingSenderId: "29096385423",
    appId: "1:29096385423:web:cf12f310609b29f10f09fa",
    measurementId: "G-GVQ8MEVDV2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Force long-polling to bypass firewalls/network blocks
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
export const analytics = getAnalytics(app);
