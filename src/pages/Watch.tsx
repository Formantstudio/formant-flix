import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./Watch.module.css";

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  useEffect(() => {
    document.title = "Formant-Flix — Watch";
    return () => { document.title = "Formant-Flix"; };
  }, [videoId]);

  // On mobile: request fullscreen + orientation lock
  useEffect(() => {
    if (!isMobile) return;

    const el = playerWrapRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }

    if (screen.orientation && "lock" in screen.orientation) {
      (screen.orientation as { lock: (o: string) => Promise<void> })
        .lock("landscape")
        .catch(() => {});
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (screen.orientation && "unlock" in screen.orientation) {
        (screen.orientation as { unlock: () => void }).unlock();
      }
    };
  }, [isMobile]);

  // Auto-hide controls after 3s on mobile
  useEffect(() => {
    if (!isMobile) return;
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isMobile]);

  const handleTouch = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  if (!videoId) {
    navigate("/");
    return null;
  }

  return (
    <div className={`${styles.page} ${isMobile ? styles.pageMobile : ""}`} onTouchStart={handleTouch}>
      {!isMobile && <Navbar />}

      <div className={isMobile ? styles.mobileWrap : styles.content}>
        {!isMobile && (
          <button className={styles.back} onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}

        <div
          className={isMobile ? styles.playerWrapMobile : styles.playerWrap}
          ref={playerWrapRef}
        >
          <iframe
            className={styles.player}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Formant-Flix Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />

          {isMobile && controlsVisible && (
            <button
              className={styles.mobileClose}
              onClick={() => navigate(-1)}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
