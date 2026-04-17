import { useEffect, useState } from "react";
import type { YouTubeChannel, YouTubeListResponse, YouTubePlaylist, YouTubeVideo } from "../types/youtube";

export interface PlaylistRow {
  playlist: YouTubePlaylist;
  videos: YouTubeVideo[];
}

interface ChannelData {
  channel: YouTubeChannel | null;
  latestVideos: YouTubeVideo[];
  rows: PlaylistRow[];
  loading: boolean;
  error: string | null;
}

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

async function ytFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${YT_BASE}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `YouTube API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useChannel(): ChannelData {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [latestVideos, setLatestVideos] = useState<YouTubeVideo[]>([]);
  const [rows, setRows] = useState<PlaylistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch channel, playlists, and latest videos in parallel
        const [channelData, playlistData, latestSearch] = await Promise.all([
          ytFetch<YouTubeListResponse<YouTubeChannel>>("channels", {
            part: "snippet,statistics,brandingSettings",
            id: CHANNEL_ID,
          }),
          ytFetch<YouTubeListResponse<YouTubePlaylist>>("playlists", {
            part: "snippet,contentDetails",
            channelId: CHANNEL_ID,
            maxResults: "20",
          }),
          ytFetch<{ items: Array<{ id: { videoId: string } }> }>("search", {
            part: "snippet",
            channelId: CHANNEL_ID,
            type: "video",
            order: "date",
            maxResults: "10",
          }),
        ]);

        if (cancelled) return;

        const ch = channelData.items[0] ?? null;
        const playlists = playlistData.items.filter(
          (p) => p.contentDetails.itemCount > 0 && p.snippet.title !== "Favorites"
        );

        // Batch fetch full video details for latest
        const latestIds = latestSearch.items.map((i) => i.id.videoId).join(",");
        const latestDetails = latestIds
          ? await ytFetch<YouTubeListResponse<YouTubeVideo>>("videos", {
              part: "snippet,contentDetails,statistics",
              id: latestIds,
            })
          : { items: [] as YouTubeVideo[] };

        if (cancelled) return;

        setChannel(ch);
        setLatestVideos(latestDetails.items);

        // Fetch playlist videos in parallel
        const rowResults = await Promise.all(
          playlists.map(async (playlist) => {
            try {
              const items = await ytFetch<{ items: Array<{ snippet: { resourceId?: { videoId: string } } }> }>(
                "playlistItems",
                { part: "snippet", playlistId: playlist.id, maxResults: "12" }
              );
              const videoIds = items.items
                .map((i) => i.snippet.resourceId?.videoId)
                .filter(Boolean)
                .join(",");
              if (!videoIds) return { playlist, videos: [] as YouTubeVideo[] };
              const details = await ytFetch<YouTubeListResponse<YouTubeVideo>>("videos", {
                part: "snippet,contentDetails,statistics",
                id: videoIds,
              });
              const seen = new Set<string>();
              const unique = details.items.filter((v) => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
              });
              return { playlist, videos: unique };
            } catch {
              return { playlist, videos: [] as YouTubeVideo[] };
            }
          })
        );

        if (cancelled) return;
        setRows(rowResults.filter((r) => r.videos.length > 0));
      } catch (e) {
        if (!cancelled) setError(String(e instanceof Error ? e.message : e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { channel, latestVideos, rows, loading, error };
}
