// lib/firebaseAuth.ts
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "./firebase";

export const logout = () => signOut(auth);
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result; // ✅ returns user credential
  } catch (error) {
    console.error("Google sign-in failed:", error);
    throw error;
  }
};

export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result; // ✅ returns user credential
  } catch (error) {
    console.error("GitHub sign-in failed:", error);
    throw error;
  }
};
