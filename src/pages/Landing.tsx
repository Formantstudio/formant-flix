import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Landing.module.css";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.bg} style={{ backgroundImage: "url(/formantBG2026.png)" }}>
        <div className={styles.overlay} />
      </div>

      <nav className={styles.nav}>
        <span className={styles.logo}>FORMANT<span className={styles.flix}>FLIX</span></span>
        <button
          className={styles.signInBtn}
          onClick={() => navigate(user ? "/browse" : "/login")}
        >
          {user ? "Browse" : "Sign In"}
        </button>
      </nav>

      <div className={styles.hero}>
        <h1 className={styles.title}>
          Music. Dev Logs. Art.<br />All in one place.
        </h1>
        <p className={styles.subtitle}>
          Watch Tyler's full creative catalogue — drum and bass, psychedelic music,
          game dev logs, animations, and more. Unlimited. Ad-free.
        </p>
        <div className={styles.cta}>
          <button
            className={styles.ctaBtn}
            onClick={() => navigate(user ? "/browse" : "/login")}
          >
            {user ? "Keep Watching" : "Get Started"}
          </button>
          {!user && (
            <button
              className={styles.ctaBtnSecondary}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.features}>
        <div className={styles.feature}>
          <h2>Watch everywhere.</h2>
          <p>Stream on your phone, tablet, laptop, or desktop. No ads. No interruptions.</p>
        </div>
        <div className={styles.feature}>
          <h2>Your list.</h2>
          <p>Save videos to your personal watchlist and pick up where you left off.</p>
        </div>
        <div className={styles.feature}>
          <h2>Always fresh.</h2>
          <p>New uploads hit the feed automatically. The catalogue keeps growing.</p>
        </div>
      </div>
    </div>
  );
}
