import { useState, useEffect } from "react";
import {
  doc, setDoc, deleteDoc, collection, query, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setWatchlist(new Set()); return; }
    const q = query(collection(db, "users", user.uid, "watchlist"));
    const unsub = onSnapshot(q, (snap) => {
      setWatchlist(new Set(snap.docs.map((d) => d.id)));
    });
    return unsub;
  }, [user]);

  const add = async (videoId: string, title: string, thumbnail: string) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "watchlist", videoId), {
      videoId, title, thumbnail, addedAt: serverTimestamp(),
    });
  };

  const remove = async (videoId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "watchlist", videoId));
  };

  const toggle = (videoId: string, title: string, thumbnail: string) => {
    if (watchlist.has(videoId)) return remove(videoId);
    return add(videoId, title, thumbnail);
  };

  return { watchlist, toggle, isInList: (id: string) => watchlist.has(id) };
}
