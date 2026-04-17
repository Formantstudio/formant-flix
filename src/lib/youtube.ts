import type {
  YouTubeChannel,
  YouTubeListResponse,
  YouTubePlaylist,
  YouTubeVideo,
} from "../types/youtube";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;
const BASE = "https://www.googleapis.com/youtube/v3";

async function get<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `YouTube API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchChannel(channelId: string): Promise<YouTubeChannel> {
  const data = await get<YouTubeListResponse<YouTubeChannel>>("channels", {
    part: "snippet,statistics,brandingSettings",
    id: channelId,
  });
  const channel = data.items[0];
  if (!channel) throw new Error("Channel not found");
  return channel;
}

export async function fetchPlaylists(channelId: string, maxResults = 20): Promise<YouTubePlaylist[]> {
  const data = await get<YouTubeListResponse<YouTubePlaylist>>("playlists", {
    part: "snippet,contentDetails",
    channelId,
    maxResults: String(maxResults),
  });
  return data.items;
}

export async function fetchPlaylistVideos(playlistId: string, maxResults = 12): Promise<YouTubeVideo[]> {
  // First get playlist items (gives us videoIds + snippets)
  const items = await get<YouTubeListResponse<YouTubeVideo>>("playlistItems", {
    part: "snippet",
    playlistId,
    maxResults: String(maxResults),
  });

  // Then fetch full video details (duration, stats) in one batched call
  const videoIds = items.items
    .map((i) => i.snippet.resourceId?.videoId)
    .filter(Boolean)
    .join(",");

  if (!videoIds) return [];

  const details = await get<YouTubeListResponse<YouTubeVideo>>("videos", {
    part: "snippet,contentDetails,statistics",
    id: videoIds,
  });

  return details.items;
}

export async function fetchChannelVideos(channelId: string, maxResults = 20): Promise<YouTubeVideo[]> {
  // Use search to get latest uploads from channel
  const data = await get<YouTubeListResponse<{ id: { videoId: string }; snippet: YouTubeVideo["snippet"] }>>(
    "search",
    {
      part: "snippet",
      channelId,
      type: "video",
      order: "date",
      maxResults: String(maxResults),
    }
  );

  const videoIds = data.items.map((i) => i.id.videoId).join(",");
  if (!videoIds) return [];

  const details = await get<YouTubeListResponse<YouTubeVideo>>("videos", {
    part: "snippet,contentDetails,statistics",
    id: videoIds,
  });

  return details.items;
}

// Parse ISO 8601 duration to readable string e.g. "PT4M13S" → "4:13"
export function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
