-- Adds a URL-friendly slug to playlists, used by /playlist/{slug}.
-- Run this against the ArtsConnect project (pjuyzybsyguuqaesiiyu) before
-- deploying — the app code assumes this column exists.

alter table public.playlists
  add column if not exists slug text;

-- Enforce uniqueness once existing rows (if any) have a slug backfilled.
-- Backfill first, e.g.:
--   update public.playlists set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
--   where slug is null;
-- then run:
create unique index if not exists playlists_slug_key on public.playlists (slug);
