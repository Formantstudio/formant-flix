import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signIn,
  signUp,
  signInWithGoogle,
  normalizeAuthError,
  authErrorMessage,
} from "../lib/auth";
import styles from "./Login.module.css";

type Mode = "signin" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn({ email, password });
      } else {
        await signUp({ email, password, displayName, confirmPassword });
      }
      navigate("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(authErrorMessage(normalizeAuthError(code)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(authErrorMessage(normalizeAuthError(code)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} style={{ backgroundImage: "url(/formantBG2026.png)" }}>
        <div className={styles.bgOverlay} />
      </div>

      {/* Logo */}
      <div className={styles.logoWrap}>
        <span className={styles.logo}>FORMANT<span className={styles.flix}>FLIX</span></span>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              className={styles.input}
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
            />
          )}
          <input
            className={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
          {mode === "signup" && (
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className={styles.toggle}>
          {mode === "signin" ? "New to Formant-Flix? " : "Already have an account? "}
          <button
            className={styles.toggleBtn}
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
