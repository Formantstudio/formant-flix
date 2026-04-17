import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "./UserMenu";
import SearchBar from "./SearchBar";
import styles from "./Navbar.module.css";

interface Props {
  search?: string;
  onSearch?: (v: string) => void;
}

export default function Navbar({ search, onSearch }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.left}>
        <Link to={user ? "/browse" : "/"} className={styles.logo}>
          FORMANT<span className={styles.flix}>FLIX</span>
        </Link>
        {user && <Link to="/browse" className={styles.link}>Browse</Link>}
      </div>

      <div className={styles.right}>
        {onSearch !== undefined && (
          <SearchBar value={search ?? ""} onChange={onSearch} />
        )}
        <a
          href="https://www.youtube.com/@formantaudio"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          YouTube
        </a>
        {user ? (
          <UserMenu />
        ) : (
          <Link to="/login" className={styles.signInBtn}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}
