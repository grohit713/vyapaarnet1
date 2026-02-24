import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type UserRole = 'buyer' | 'seller';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isVerified?: boolean;
    companyName?: string;
    gst?: string;
}

const CURRENT_USER_KEY = 'vyapaarnet_current_user';

export const authService = {
    // Sign up with email and password
    signup: async (email: string, password: string): Promise<void> => {
        await createUserWithEmailAndPassword(auth, email, password);
    },

    // Sign in with email and password
    signin: async (email: string, password: string): Promise<User | null> => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = result.user;

        // Check Firestore for user
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
                return userData;
            }
        } catch (error: any) {
            console.error("Firestore Error:", error);
            if (error.code === 'unavailable' || error.message.includes('offline')) {
                console.warn("Offline mode: Proceeding to registration flow.");
                return null;
            }
            throw error;
        }

        // Return null if user doesn't exist in DB (caller will trigger registration)
        return null;
    },

    register: async (data: Omit<User, 'id'>): Promise<User> => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No authenticated user found");

        const newUser: User = {
            ...data,
            id: currentUser.uid, // Use Firebase Auth UID as the User ID
        };

        // Save to Firestore
        await setDoc(doc(db, 'users', currentUser.uid), newUser);

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        return newUser;
    },

    logout: async () => {
        await signOut(auth);
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    updateUser: async (user: User) => {
        // Update Firestore
        const userDocRef = doc(db, 'users', user.id);
        await setDoc(userDocRef, user, { merge: true });

        // Update Local State
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
};
