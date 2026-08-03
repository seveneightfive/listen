import { supabase } from "./supabase";
import type { ArtistSummary, Playlist, Song } from "./types";

// Raw shape returned by the nested Supabase select below, before we
// flatten `artist_musician_profiles.artists` down onto `song.artist`.
interface RawTrackRow {
  position: number | null;
  songs: {
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
    artist_musician_profiles: {
      artist_id: string | null;
      artists: {
        id: string;
        name: string | null;
        slug: string | null;
        avatar_url: string | null;
        image_url: string | null;
      } | null;
    } | null;
  } | null;
}

/**
 * Fetches a playlist by its slug, with every track's song + artist
 * pulled in as one round trip, ordered by playlist_tracks.position.
 *
 * Note: `songs.artist_id` has a FK to `artist_musician_profiles.artist_id`
 * (not directly to `artists`), so we embed through that join table and
 * flatten it below. `artist_musician_profiles.artist_id` is a 1:1 unique
 * FK to `artists.id`, so the two ids are always the same value.
 */
export async function getPlaylistBySlug(
  slug: string
): Promise<Playlist | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select(
      `
      id, name, description, cover_image, type, is_public, slug,
      playlist_tracks (
        position,
        songs (
          id, title, album_name, genre, duration_seconds, audio_url,
          cover_image_url, description, is_featured, status, release_date,
          artist_id, play_count, buy_link, buy_link_count,
          artist_musician_profiles (
            artist_id,
            artists ( id, name, slug, avatar_url, image_url )
          )
        )
      )
    `
    )
    .eq("slug", slug)
    .order("position", { referencedTable: "playlist_tracks" })
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("getPlaylistBySlug error:", error.message);
    }
    return null;
  }

  const tracks = (data.playlist_tracks ?? []) as unknown as RawTrackRow[];

  const songs: Song[] = tracks
    .filter((t) => t.songs)
    .map((t) => {
      const s = t.songs!;
      const artist = s.artist_musician_profiles?.artists ?? null;
      const artistSummary: ArtistSummary | null = artist
        ? {
            id: artist.id,
            name: artist.name,
            slug: artist.slug,
            avatar_url: artist.avatar_url,
            image_url: artist.image_url,
          }
        : null;

      return {
        id: s.id,
        title: s.title,
        album_name: s.album_name,
        genre: s.genre,
        duration_seconds: s.duration_seconds,
        audio_url: s.audio_url,
        cover_image_url: s.cover_image_url,
        description: s.description,
        is_featured: s.is_featured,
        status: s.status,
        release_date: s.release_date,
        artist_id: s.artist_id,
        play_count: s.play_count,
        buy_link: s.buy_link,
        buy_link_count: s.buy_link_count,
        artist: artistSummary,
      };
    });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    cover_image: data.cover_image,
    type: data.type,
    is_public: data.is_public,
    slug: data.slug,
    songs,
  };
}

/**
 * Counts published, not-yet-happened events per artist, via the
 * event_artists join table. Returns a map of artist_id -> count so the
 * caller can attach it to each Song's artist summary.
 */
export async function getUpcomingEventCounts(
  artistIds: string[]
): Promise<Record<string, number>> {
  const uniqueIds = Array.from(new Set(artistIds.filter(Boolean)));
  if (uniqueIds.length === 0) return {};

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("event_artists")
    .select("artist_id, events!inner(id, event_date, status)")
    .in("artist_id", uniqueIds)
    .eq("events.status", "published")
    .gte("events.event_date", today);

  if (error) {
    console.error("getUpcomingEventCounts error:", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (!row.artist_id) continue;
    counts[row.artist_id] = (counts[row.artist_id] ?? 0) + 1;
  }
  return counts;
}

/**
 * Fetches all public playlists for the browse/homepage grid. Doesn't pull
 * tracks — just enough to render a card per playlist.
 */
export async function getPublicPlaylists(): Promise<
  Pick<Playlist, "id" | "name" | "description" | "cover_image" | "slug">[]
> {
  const { data, error } = await supabase
    .from("playlists")
    .select("id, name, description, cover_image, slug")
    .eq("is_public", true)
    .order("id", { ascending: false });

  if (error) {
    console.error("getPublicPlaylists error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPlaylistWithEventCounts(
  slug: string
): Promise<Playlist | null> {
  const playlist = await getPlaylistBySlug(slug);
  if (!playlist) return null;

  const artistIds = playlist.songs
    .map((s) => s.artist?.id)
    .filter((id): id is string => Boolean(id));

  const counts = await getUpcomingEventCounts(artistIds);

  for (const song of playlist.songs) {
    if (song.artist) {
      song.artist.upcomingEventCount = counts[song.artist.id] ?? 0;
    }
  }

  return playlist;
}
