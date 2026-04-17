import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./Watch.module.css";

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Formant-Flix — Watch";
    return () => { document.title = "Formant-Flix"; };
  }, [videoId]);

  if (!videoId) {
    navigate("/");
    return null;
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className={styles.playerWrap}>
          <iframe
            className={styles.player}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Formant-Flix Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
