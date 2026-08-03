import { notFound } from "next/navigation";
import { getPlaylistWithEventCounts } from "@/lib/queries";
import { PlaylistClient } from "./PlaylistClient";

export const revalidate = 60; // re-fetch playlist data at most once a minute

export default async function PlaylistPage({
  params,
}: {
  params: { slug: string };
}) {
  const playlist = await getPlaylistWithEventCounts(params.slug);

  if (!playlist) notFound();

  return <PlaylistClient playlist={playlist} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const playlist = await getPlaylistWithEventCounts(params.slug);
  if (!playlist) return {};
  return {
    title: `${playlist.name ?? "Playlist"} — Listen`,
    description: playlist.description ?? undefined,
    openGraph: playlist.cover_image
      ? { images: [{ url: playlist.cover_image }] }
      : undefined,
  };
}
