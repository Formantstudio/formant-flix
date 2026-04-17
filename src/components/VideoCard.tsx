import type { YouTubeVideo } from "../types/youtube";
import { parseDuration } from "../lib/youtube";
import styles from "./VideoCard.module.css";

interface Props {
  video: YouTubeVideo;
  onSelect: (video: YouTubeVideo) => void;
}

export default function VideoCard({ video, onSelect }: Props) {
  const thumb =
    video.snippet.thumbnails.medium?.url ??
    video.snippet.thumbnails.high.url;

  const duration = video.contentDetails?.duration
    ? parseDuration(video.contentDetails.duration)
    : null;

  const views = video.statistics?.viewCount
    ? Number(video.statistics.viewCount).toLocaleString()
    : null;

  const year = new Date(video.snippet.publishedAt).getFullYear();

  return (
    <div className={styles.card} onClick={() => onSelect(video)}>
      <div className={styles.thumbWrap}>
        <img
          src={thumb}
          alt={video.snippet.title}
          className={styles.thumb}
          loading="lazy"
        />
        {duration && <span className={styles.duration}>{duration}</span>}

        {/* Hover overlay */}
        <div className={styles.hoverOverlay}>
          <button className={styles.playIcon} aria-label="Play">▶</button>
        </div>
      </div>

      {/* Info panel — slides up on hover */}
      <div className={styles.infoPanel}>
        <div className={styles.infoActions}>
          <button className={styles.playBtn} aria-label="Play">▶</button>
          <span className={styles.infoYear}>{year}</span>
          {views && <span className={styles.infoViews}>{views} views</span>}
        </div>
        <p className={styles.infoTitle}>{video.snippet.title}</p>
        {duration && <p className={styles.infoDuration}>{duration}</p>}
      </div>
    </div>
  );
}
