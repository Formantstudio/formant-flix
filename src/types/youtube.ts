// YouTube Data API v3 — typed responses

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  brandingSettings: {
    image?: {
      bannerExternalUrl?: string;
    };
  };
}

export interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelId: string;
  };
  contentDetails: {
    itemCount: number;
  };
}

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: YouTubeThumbnails;
    playlistId?: string;
    position?: number;
    resourceId?: {
      videoId: string;
    };
  };
  contentDetails?: {
    duration: string; // ISO 8601 e.g. PT4M13S
    definition: "hd" | "sd";
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface YouTubeListResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}
