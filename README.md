# Formant-Flix

A Netflix-style video streaming app built on top of the [Formant Audio](https://www.youtube.com/@formantaudio) YouTube channel. Built as a portfolio project demonstrating production-grade React development.

**Live:** [flix.formant.ca](https://flix.formant.ca)

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Firebase Auth** — email/password + Google OAuth
- **Firestore** — user profiles, watchlist, watch history (real-time listeners)
- **Firebase Hosting** — global CDN, automatic HTTPS, strict security headers
- **Cloudflare** — custom subdomain (`flix.formant.ca`), additional CDN layer, DDoS protection
- **YouTube Data API v3** — channel, playlists, video details
- **CSS Modules** — scoped component styles, zero UI library dependencies

## Features

- Browse videos from the Formant Audio YouTube channel organized by playlist
- Hero banner, horizontal scroll rows with arrow navigation, shimmer loading skeletons
- Click any video to open a Netflix-style detail modal with suggestions
- Embedded YouTube player with autoplay
- Add/remove videos to **My List** (persisted to Firestore, real-time sync)
- **Continue Watching** row built from watch history
- Search across all channel videos
- Google and email/password authentication with protected routes

## Mobile

- On mobile, video playback redirects to a dedicated full-screen Watch page
- Attempts `screen.orientation.lock('landscape')` + `requestFullscreen()` automatically on play (Android Chrome)
- iOS: native YouTube player handles landscape fullscreen through the iframe fullscreen button
- Touch anywhere to reveal/hide the close control
- Modal layout scales to full viewport with `100dvh` on small screens — no content cut off

## Security Architecture

- **Firestore rules** — all reads and writes scoped to `request.auth.uid`. No user can touch another user's documents. Watchlist and history are subcollections locked to the owner.
- **Firebase Auth** — ID tokens verified server-side on all Cloud Function calls. No unauthenticated access to any user data.
- **Security headers** configured in `firebase.json`:
  - `Content-Security-Policy` — restricts script, style, frame, and media sources
  - `X-Frame-Options: DENY` — prevents clickjacking
  - `X-Content-Type-Options: nosniff` — blocks MIME-type sniffing
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — disables camera, microphone, geolocation
- **Cloud Functions (v2)** — YouTube API key stored in Google Secret Manager via `defineSecret`. Key never reaches the client bundle. Rate limiting enforced per-user via Firestore transactions (30 calls/min).
- **Cloudflare** — sits in front of Firebase Hosting, providing DDoS mitigation and edge-level threat filtering before requests reach the origin.

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
