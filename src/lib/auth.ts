import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
export type AuthError =
  | "invalid-email"
  | "wrong-password"
  | "user-not-found"
  | "email-in-use"
  | "weak-password"
  | "network-error"
  | "unknown";

export interface LoginCredentials { email: string; password: string; }
export interface RegisterCredentials extends LoginCredentials { displayName: string; confirmPassword: string; }

// ─── Error normalizer ─────────────────────────────────────────────────────────

export function normalizeAuthError(code: string): AuthError {
  if (code.includes("invalid-email")) return "invalid-email";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "wrong-password";
  if (code.includes("user-not-found")) return "user-not-found";
  if (code.includes("email-already-in-use")) return "email-in-use";
  if (code.includes("weak-password")) return "weak-password";
  if (code.includes("network")) return "network-error";
  return "unknown";
}

export function authErrorMessage(error: AuthError): string {
  const map: Record<AuthError, string> = {
    "invalid-email": "Invalid email address.",
    "wrong-password": "Incorrect email or password.",
    "user-not-found": "No account found with that email.",
    "email-in-use": "An account with this email already exists.",
    "weak-password": "Password must be at least 6 characters.",
    "network-error": "Network error. Check your connection.",
    "unknown": "Something went wrong. Please try again.",
  };
  return map[error];
}

// ─── Firestore user profile ───────────────────────────────────────────────────

async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      createdAt: serverTimestamp(),
    });
  }
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function signIn({ email, password }: LoginCredentials): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUp({ email, password, displayName }: RegisterCredentials): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(user, { displayName: displayName.trim() });
  await ensureUserProfile(user);
}

export async function signInWithGoogle(): Promise<void> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeAuthState(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
