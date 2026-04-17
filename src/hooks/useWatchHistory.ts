import { useState, useEffect } from "react";
import {
  doc, setDoc, collection, query, orderBy, limit,
  onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import type { YouTubeVideo } from "../types/youtube";

export interface HistoryEntry {
  videoId: string;
  title: string;
  thumbnail: string;
  watchedAt: number;
}

export function useWatchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!user) { setHistory([]); return; }
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("watchedAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => d.data() as HistoryEntry));
    });
    return unsub;
  }, [user]);

  const recordWatch = async (video: YouTubeVideo) => {
    if (!user) return;
    const thumb =
      video.snippet.thumbnails.medium?.url ??
      video.snippet.thumbnails.high.url;
    await setDoc(doc(db, "users", user.uid, "history", video.id), {
      videoId: video.id,
      title: video.snippet.title,
      thumbnail: thumb,
      watchedAt: serverTimestamp(),
    });
  };

  return { history, recordWatch };
}
