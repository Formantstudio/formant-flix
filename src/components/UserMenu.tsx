import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../lib/auth";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initial = user?.displayName?.charAt(0).toUpperCase()
    ?? user?.email?.charAt(0).toUpperCase()
    ?? "?";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.avatar} onClick={() => setOpen((o) => !o)}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt={initial} className={styles.photo} />
        ) : (
          <span className={styles.initial}>{initial}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <p className={styles.name}>{user?.displayName ?? "Account"}</p>
            <p className={styles.email}>{user?.email}</p>
          </div>
          <div className={styles.divider} />
          <button className={styles.dropItem} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
