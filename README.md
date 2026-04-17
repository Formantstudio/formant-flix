# Formant-Flix

A Netflix-style video streaming app built on top of the [Formant Audio](https://www.youtube.com/@formantaudio) YouTube channel. Built as a portfolio project demonstrating production-grade React development.

**Live:** [formant-flix.web.app](https://formant-flix.web.app)

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Firebase Auth** — email/password + Google OAuth
- **Firestore** — user profiles, watchlist, watch history
- **Firebase Hosting** — SPA with security headers
- **YouTube Data API v3** — channel, playlists, video details
- **CSS Modules** — scoped component styles throughout

## Features

- Browse videos from the Formant Audio YouTube channel organized by playlist
- Hero banner, horizontal scroll rows with arrow navigation, shimmer loading skeletons
- Click any video to open a Netflix-style detail modal with suggestions
- Embedded YouTube player with autoplay
- Add/remove videos to **My List** (persisted to Firestore)
- **Continue Watching** row built from watch history
- Search across all channel videos
- Google and email/password authentication
- Protected routes — browse requires sign-in

## Architecture Notes

- YouTube API key is stored server-side in Google Secret Manager via Firebase Cloud Functions (v2). The client never sees it.
- Rate limiting enforced per-user via Firestore transactions (30 calls/min)
- Zero-trust callable functions: all calls require a valid Firebase ID token
- Firestore rules scope all reads/writes to the authenticated user's own documents

## Local Setup

```bash
npm install
```

Create a `.env` file at the root:

```
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_YOUTUBE_CHANNEL_ID=your_channel_id
```

```bash
npm run dev
```

## Deploy

```bash
npm run build
firebase deploy --only hosting
```

Functions:

```bash
firebase deploy --only "functions:getChannelData,functions:getPlaylistVideos"
```
