import type { YouTubeVideo } from "../types/youtube";
import styles from "./HeroBanner.module.css";

interface Props {
  video: YouTubeVideo;
  onSelect: (video: YouTubeVideo) => void;
}

export default function HeroBanner({ video, onSelect }: Props) {
  const bg = "/formantBG2026.png";

  return (
    <div className={styles.hero} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={styles.label}>Latest Upload</p>
        <h1 className={styles.title}>{video.snippet.title}</h1>
        <p className={styles.description}>
          {video.snippet.description.slice(0, 180)}
          {video.snippet.description.length > 180 ? "…" : ""}
        </p>
        <div className={styles.actions}>
          <button className={styles.playBtn} onClick={() => onSelect(video)}>
            ▶ Play
          </button>
          <button className={styles.moreBtn} onClick={() => onSelect(video)}>
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
