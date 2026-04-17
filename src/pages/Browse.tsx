import { useState, useCallback, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import HeroBanner from "../components/HeroBanner";
import VideoRow from "../components/VideoRow";
import VideoModal from "../components/VideoModal";
import SkeletonRow from "../components/SkeletonRow";
import { useChannel } from "../hooks/useChannel";
import { useWatchlist } from "../hooks/useWatchlist";
import { useWatchHistory } from "../hooks/useWatchHistory";
import type { YouTubeVideo } from "../types/youtube";
import styles from "./Browse.module.css";

export default function Browse() {
  const { latestVideos, rows, loading, error } = useChannel();
  const { watchlist } = useWatchlist();
  const { history } = useWatchHistory();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { document.title = "Formant-Flix — Browse"; }, []);

  const handleSelect = useCallback((video: YouTubeVideo) => setSelectedVideo(video), []);
  const handleClose = useCallback(() => setSelectedVideo(null), []);

  // All videos flattened for suggestions + search
  const allVideos: YouTubeVideo[] = useMemo(() => [
    ...latestVideos,
    ...rows.flatMap((r) => r.videos),
  ].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i), [latestVideos, rows]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allVideos.filter((v) => v.snippet.title.toLowerCase().includes(q));
  }, [search, allVideos]);

  // My List row — match watchlist ids to full video objects
  const myListVideos = useMemo(() =>
    allVideos.filter((v) => watchlist.has(v.id)),
    [allVideos, watchlist]
  );

  // Continue Watching row — match history to full video objects, preserve order
  const continueWatchingVideos = useMemo(() =>
    history
      .map((h) => allVideos.find((v) => v.id === h.videoId))
      .filter((v): v is YouTubeVideo => v !== undefined),
    [history, allVideos]
  );

  if (error) {
    return <div className={styles.error}><p>Failed to load: {error}</p></div>;
  }

  const heroVideo = latestVideos[0];

  return (
    <div className={styles.page}>
      <Navbar search={search} onSearch={setSearch} />

      {/* Search results overlay */}
      {search.trim() ? (
        <div className={styles.searchResults}>
          <div className={styles.rows}>
            {searchResults.length > 0 ? (
              <VideoRow
                title={`Results for "${search}"`}
                videos={searchResults}
                onSelect={handleSelect}
              />
            ) : (
              <p className={styles.noResults}>No videos match "{search}"</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Hero */}
          {loading ? (
            <div className={styles.heroSkeleton} />
          ) : (
            heroVideo && <HeroBanner video={heroVideo} onSelect={handleSelect} />
          )}

          {/* Rows */}
          <div className={styles.rows}>
            {loading ? (
              <>
                <SkeletonRow cardCount={6} />
                <SkeletonRow cardCount={6} />
                <SkeletonRow cardCount={6} />
              </>
            ) : (
              <>
                {continueWatchingVideos.length > 0 && (
                  <VideoRow title="Continue Watching" videos={continueWatchingVideos} onSelect={handleSelect} />
                )}
                {myListVideos.length > 0 && (
                  <VideoRow title="My List" videos={myListVideos} onSelect={handleSelect} />
                )}
                {latestVideos.length > 1 && (
                  <VideoRow title="Latest Uploads" videos={latestVideos.slice(1)} onSelect={handleSelect} />
                )}
                {rows.map(({ playlist, videos }) => (
                  <VideoRow key={playlist.id} title={playlist.snippet.title} videos={videos} onSelect={handleSelect} />
                ))}
              </>
            )}
          </div>
        </>
      )}

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          suggestions={allVideos.filter((v) => v.id !== selectedVideo.id)}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
