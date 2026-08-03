import Image from "next/image";
import Link from "next/link";
import { getPublicPlaylists } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const playlists = await getPublicPlaylists();

  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-16">
      <header className="mb-10 sm:mb-14">
        <span className="inline-block rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900">
          785
        </span>
        <h1 className="mt-4 font-display text-title-md uppercase tracking-wide text-gray-900 sm:text-title-lg">
          Listen
        </h1>
        <p className="mt-2 max-w-lg text-theme-sm text-gray-500">
          Music from Topeka artists — curated playlists, streamed straight
          from the source.
        </p>
      </header>

      {playlists.length === 0 ? (
        <p className="text-theme-sm text-gray-500">
          No playlists published yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.slug}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-theme-sm transition group-hover:shadow-theme-md">
                {playlist.cover_image ? (
                  <Image
                    src={playlist.cover_image}
                    alt={playlist.name ?? "Playlist cover"}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    No cover
                  </div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-600/0 via-transparent to-transparent opacity-0 transition group-hover:opacity-100 group-hover:from-brand-600/40" />
              </div>
              <p className="mt-2.5 truncate font-display text-sm font-medium uppercase tracking-wide text-gray-900 group-hover:text-brand-600">
                {playlist.name ?? "Untitled playlist"}
              </p>
              {playlist.description && (
                <p className="truncate text-xs text-gray-500">
                  {playlist.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
