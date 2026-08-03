// Mirrors public.artists (only the columns the player needs)
export interface ArtistSummary {
  id: string;
  name: string | null;
  slug: string | null;
  avatar_url: string | null;
  image_url: string | null;
  /** Filled in client-side after a separate events lookup. */
  upcomingEventCount?: number;
}

// Mirrors public.songs, with the artist relation flattened on after fetch
export interface Song {
  id: number;
  title: string | null;
  album_name: string | null;
  genre: string | null;
  duration_seconds: number | null;
  audio_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  is_featured: boolean | null;
  status: string | null;
  release_date: string | null;
  artist_id: string | null;
  play_count: number;
  buy_link: string | null;
  buy_link_count: number | null;
  artist: ArtistSummary | null;
}

// Mirrors public.playlists, plus the `slug` column added by
// migrations/001_add_playlist_slug.sql
export interface Playlist {
  id: number;
  name: string | null;
  description: string | null;
  cover_image: string | null;
  type: string | null;
  is_public: boolean | null;
  slug: string;
  songs: Song[];
}

export type RepeatMode = "off" | "all" | "one";
