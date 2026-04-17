import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();

const youtubeApiKey = defineSecret("YOUTUBE_API_KEY");

const YT_BASE = "https://www.googleapis.com/youtube/v3";

// ─── Rate limiting ────────────────────────────────────────────────────────────

const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_CALLS = 30;     // per user per window

async function enforceRateLimit(uid: string): Promise<void> {
  const db = admin.firestore();
  const ref = db.collection("rateLimits").doc(`yt_${uid}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();

    if (!snap.exists) {
      tx.set(ref, { count: 1, windowStart: now });
      return;
    }

    const { count, windowStart } = snap.data() as { count: number; windowStart: number };

    if (now - windowStart > RATE_WINDOW_MS) {
      tx.set(ref, { count: 1, windowStart: now });
      return;
    }

    if (count >= RATE_MAX_CALLS) {
      throw new HttpsError("resource-exhausted", "Rate limit exceeded. Try again in a minute.");
    }

    tx.update(ref, { count: count + 1 });
  });
}

// ─── YouTube fetch helper ─────────────────────────────────────────────────────

async function ytFetch<T>(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
): Promise<T> {
  const url = new URL(`${YT_BASE}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new HttpsError("internal", err?.error?.message ?? `YouTube API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Callable: getChannelData ─────────────────────────────────────────────────
// Zero trust: requires valid Firebase Auth token.
// Client never sees the YouTube API key.

export const getChannelData = onCall(
  { secrets: [youtubeApiKey], cors: true, invoker: "public" },
  async (req) => {
    // Auth check — zero trust
    if (!req.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    await enforceRateLimit(req.auth.uid);

    const apiKey = youtubeApiKey.value();
    const CHANNEL_ID = "UCjSW8KaxNUh3kDQqcDuqWVg";

    const [channel, playlists, latest] = await Promise.all([
      ytFetch<unknown>("channels", {
        part: "snippet,statistics,brandingSettings",
        id: CHANNEL_ID,
      }, apiKey),
      ytFetch<unknown>("playlists", {
        part: "snippet,contentDetails",
        channelId: CHANNEL_ID,
        maxResults: "20",
      }, apiKey),
      ytFetch<{ items: Array<{ id: { videoId: string } }> }>("search", {
        part: "snippet",
        channelId: CHANNEL_ID,
        type: "video",
        order: "date",
        maxResults: "10",
      }, apiKey),
    ]);

    // Batch fetch full video details for latest
    const latestIds = latest.items.map((i) => i.id.videoId).join(",");
    const latestDetails = latestIds
      ? await ytFetch<unknown>("videos", {
          part: "snippet,contentDetails,statistics",
          id: latestIds,
        }, apiKey)
      : { items: [] };

    return { channel, playlists, latestVideos: latestDetails };
  }
);

// ─── Callable: getPlaylistVideos ──────────────────────────────────────────────

export const getPlaylistVideos = onCall(
  { secrets: [youtubeApiKey], cors: true, invoker: "public" },
  async (req) => {
    if (!req.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    await enforceRateLimit(req.auth.uid);

    const { playlistId, maxResults = 12 } = req.data as {
      playlistId: string;
      maxResults?: number;
    };

    if (!playlistId || typeof playlistId !== "string") {
      throw new HttpsError("invalid-argument", "playlistId is required.");
    }

    const apiKey = youtubeApiKey.value();

    const items = await ytFetch<{ items: Array<{ snippet: { resourceId?: { videoId: string } } }> }>(
      "playlistItems",
      { part: "snippet", playlistId, maxResults: String(maxResults) },
      apiKey
    );

    const videoIds = items.items
      .map((i) => i.snippet.resourceId?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) return { items: [] };

    const details = await ytFetch<unknown>("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoIds,
    }, apiKey);

    return details;
  }
);
