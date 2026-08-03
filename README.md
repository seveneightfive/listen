# listen.seveneightfive.com — music player

Next.js (App Router) + Tailwind. A persistent bottom mini player (`MiniPlayer`,
mounted once in `app/layout.tsx`) shares a single `PlayerContext` audio engine
with the full-screen "now playing" experience at `/playlist/[slug]`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the two Supabase values below
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://pjuyzybsyguuqaesiiyu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase project settings>
```

## Before this will run: add the `slug` column

`public.playlists` doesn't have a `slug` column yet, and `/playlist/[slug]`
depends on it. Run `migrations/001_add_playlist_slug.sql` against the
**ArtsConnect** project (`pjuyzybsyguuqaesiiyu`), backfilling slugs for any
existing rows first (the migration file has a commented-out example).

## Architecture

- **`context/PlayerContext.tsx`** — the audio engine. One `<audio>` element,
  shared queue/shuffle/repeat/volume state, exposed via `usePlayer()`. This
  is what makes the player "live at the bottom of every page": it's mounted
  once in the root layout, so navigating between pages doesn't interrupt
  playback.
- **`components/player/MiniPlayer.tsx`** — the persistent bottom bar
  (play/pause, next/prev, shuffle, repeat, volume, seek, queue button).
  Renders `null` when nothing is loaded.
- **`components/player/FullScreenPlayer.tsx`** — the mobile-first
  now-playing view used on `/playlist/[slug]`: artwork with a circular seek
  ring, title, artist, an "upcoming events" tag (links out to
  `seveneightfive.com/artist/{slug}`), a **Buy** button (only rendered when
  `songs.buy_link` is set), and a share button.
- **`components/player/TrackList.tsx`** — the scrollable list of the rest of
  the playlist's tracks, shown below the hero.
- **`lib/queries.ts`** — the two Supabase reads: the playlist (with tracks →
  songs → artist, in one round trip) and a batched "upcoming events per
  artist" count via `event_artists` + `events`.

### Why the artist join goes through `artist_musician_profiles`

`songs.artist_id` has an FK to `artist_musician_profiles.artist_id`, not
directly to `artists.id` (even though the two ids are always equal, since
`artist_musician_profiles.artist_id` is a unique 1:1 FK to `artists.id`).
`getPlaylistBySlug` embeds through that join table and flattens the result
onto `song.artist` so components never have to know about the indirection.

### "Upcoming events" tag

Counted via `event_artists` joined to `events` where `status = 'published'`
and `event_date >= today`. Adjust the status/date filter in
`getUpcomingEventCounts` if you also want to count `draft` events for
artist-facing previews, or fold in `event_performances` for
production/theatre-style multi-date runs.

## ⚠️ Security advisory from your Supabase project

Unrelated to this feature, but surfaced while inspecting the schema: **16
tables have Row Level Security disabled**, including `event_registration_responses`,
`magazine_issues`, `hero_slides`, and others — meaning the anon key (the one
this app uses) can read/write every row in them. This isn't something I
changed or will change automatically. If you want to lock them down, the
enable statements are:

```sql
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_reminder_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registration_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_issue_callouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_artist_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_performance_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_survey_requests ENABLE ROW LEVEL SECURITY;
```

Enabling RLS with **no policies** blocks all access (including your own
server code), so don't run this blind — add `select` policies for the
tables the public site actually needs to read first. Also note
`public.songs` and `public.playlists` already have RLS **enabled**, so
double check they have a public-read policy covering `status`/`is_public`,
or this app's reads will silently return empty results.

## Design tokens

Ink-dark background (`#15130f`), marigold accent (`#e8a33d`) for primary
controls, moss green (`#6e8c6c`) for the upcoming-events tag — a record-label
/ tape-deck palette rather than a generic dark dashboard. `Barlow Condensed`
for song titles (vinyl-label lettering), `IBM Plex Mono` for the time
readouts (tape-counter digits), `Inter` for everything else. The signature
element is the circular seek ring around the artwork on the full-screen
player.
