import { useEffect, useRef, useState } from "react";
import type { YouTubeVideo } from "../types/youtube";
import { parseDuration } from "../lib/youtube";
import { useWatchlist } from "../hooks/useWatchlist";
import { useWatchHistory } from "../hooks/useWatchHistory";
import styles from "./VideoModal.module.css";

interface Props {
  video: YouTubeVideo;
  suggestions: YouTubeVideo[];
  onClose: () => void;
  onSelect: (video: YouTubeVideo) => void;
}

export default function VideoModal({ video, suggestions, onClose, onSelect }: Props) {
  const [playing, setPlaying] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { isInList, toggle } = useWatchlist();
  const { recordWatch } = useWatchHistory();

  const handlePlay = () => {
    setPlaying(true);
    recordWatch(video);
  };

  const thumb =
    video.snippet.thumbnails.maxres?.url ??
    video.snippet.thumbnails.standard?.url ??
    video.snippet.thumbnails.high.url;

  const duration = video.contentDetails?.duration
    ? parseDuration(video.contentDetails.duration)
    : null;

  const views = video.statistics?.viewCount
    ? Number(video.statistics.viewCount).toLocaleString()
    : null;

  const publishedYear = new Date(video.snippet.publishedAt).getFullYear();

  // Switching to a suggestion: reset player, scroll modal to top
  const handleSuggestionClick = (v: YouTubeVideo) => {
    onSelect(v);
    modalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Reset player when video changes
  useEffect(() => { setPlaying(false); }, [video.id]);

  const shown = suggestions.slice(0, 12);

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal} ref={modalRef}>

        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* Media */}
        <div className={styles.media}>
          {playing ? (
            <iframe
              className={styles.player}
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
              title={video.snippet.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={styles.thumbWrap} onClick={handlePlay}>
              <img src={thumb} alt={video.snippet.title} className={styles.thumb} />
              <div className={styles.thumbOverlay}>
                <button className={styles.bigPlay}>▶</button>
              </div>
            </div>
          )}
          {!playing && <div className={styles.mediaFade} />}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.actions}>
            <button className={styles.playBtn} onClick={handlePlay}>▶ Play</button>
            <button
              className={`${styles.listBtn} ${isInList(video.id) ? styles.listBtnActive : ""}`}
              onClick={() => toggle(video.id, video.snippet.title, thumb)}
              aria-label={isInList(video.id) ? "Remove from My List" : "Add to My List"}
            >
              {isInList(video.id) ? "✓ My List" : "+ My List"}
            </button>
            <a
              className={styles.ytBtn}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube ↗
            </a>
          </div>
          <div className={styles.meta}>
            <span className={styles.year}>{publishedYear}</span>
            {duration && <span className={styles.duration}>{duration}</span>}
            {views && <span className={styles.views}>{views} views</span>}
          </div>
          <h2 className={styles.title}>{video.snippet.title}</h2>
          <p className={styles.description}>
            {video.snippet.description.slice(0, 400)}
            {video.snippet.description.length > 400 ? "…" : ""}
          </p>
        </div>

        {/* Suggestions */}
        {shown.length > 0 && (
          <div className={styles.suggestions}>
            <h3 className={styles.suggestionsTitle}>More Videos</h3>
            <div className={styles.suggestionsGrid}>
              {shown.map((v) => {
                const t =
                  v.snippet.thumbnails.medium?.url ??
                  v.snippet.thumbnails.high.url;
                const dur = v.contentDetails?.duration
                  ? parseDuration(v.contentDetails.duration)
                  : null;
                return (
                  <div
                    key={v.id}
                    className={styles.suggCard}
                    onClick={() => handleSuggestionClick(v)}
                  >
                    <div className={styles.suggThumbWrap}>
                      <img src={t} alt={v.snippet.title} className={styles.suggThumb} loading="lazy" />
                      {dur && <span className={styles.suggDur}>{dur}</span>}
                      <div className={styles.suggPlay}>▶</div>
                    </div>
                    <div className={styles.suggInfo}>
                      <p className={styles.suggTitle}>{v.snippet.title}</p>
                      {v.statistics?.viewCount && (
                        <p className={styles.suggViews}>
                          {Number(v.statistics.viewCount).toLocaleString()} views
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
