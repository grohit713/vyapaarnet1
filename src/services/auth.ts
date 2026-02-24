import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

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
        return authService.handlePostSignIn(result.user);
    },

    // Sign in with Google
    signInWithGoogle: async (): Promise<User | null> => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return authService.handlePostSignIn(result.user);
    },

    // Shared logic for checking firestore after signin
    handlePostSignIn: async (firebaseUser: any): Promise<User | null> => {
        console.log("Checking Firestore for user:", firebaseUser.uid);
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                console.log("User found in Firestore, updating stats...");

                // Track login stats
                const today = new Date().toISOString().split('T')[0];
                const stats = (userData as any).loginStats || {};
                const dailyCount = (stats[today] || 0) + 1;

                try {
                    await setDoc(userDocRef, {
                        loginStats: {
                            ...stats,
                            [today]: dailyCount,
                            lastLogin: Timestamp.now()
                        }
                    }, { merge: true });
                } catch (statsErr) {
                    console.warn("Failed to update login stats (non-critical):", statsErr);
                }

                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
                return userData;
            }
        } catch (error: any) {
            console.error("Firestore Error during signin:", error);
            if (error.code === 'unavailable' || error.message.includes('offline') || error.code === 'permission-denied') {
                return null;
            }
            throw error;
        }

        return null;
    },

    register: async (data: Omit<User, 'id'>): Promise<User> => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No authenticated user found");
        console.log("Registering user in Firestore:", currentUser.uid);

        const newUser: User = {
            ...data,
            id: currentUser.uid,
        };

        try {
            console.log("Saving user data to 'users' collection...");

            // Set a 15-second timeout for Firestore write to prevent infinite hang
            const writePromise = setDoc(doc(db, 'users', currentUser.uid), newUser);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database Timeout: The connection is too slow or blocked by a firewall. Please check your internet or Firebase Rules.")), 15000)
            );

            await Promise.race([writePromise, timeoutPromise]);
            console.log("User data saved successfully!");
        } catch (error: any) {
            console.error("Critical Error saving to Firestore:", error);
            if (error.code === 'permission-denied') {
                throw new Error("Database permission denied. Please check your Firestore Security Rules.");
            }
            throw error;
        }

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
