import { useRef, useState, useCallback, useEffect } from "react";
import type { YouTubeVideo } from "../types/youtube";
import VideoCard from "./VideoCard";
import styles from "./VideoRow.module.css";

interface Props {
  title: string;
  videos: YouTubeVideo[];
  onSelect: (video: YouTubeVideo) => void;
}

export default function VideoRow({ title, videos, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    setCanLeft(t.scrollLeft > 4);
    setCanRight(t.scrollLeft < t.scrollWidth - t.clientWidth - 4);
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    updateArrows();
    t.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(t);
    return () => {
      t.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows, videos]);

  const scroll = (dir: "left" | "right") => {
    const t = trackRef.current;
    if (!t) return;
    const amount = t.clientWidth * 0.8;
    t.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  if (videos.length === 0) return null;

  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.sliderWrap}>
        {canLeft && (
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}
        <div className={styles.track} ref={trackRef}>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onSelect={onSelect} />
          ))}
        </div>
        {canRight && (
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
