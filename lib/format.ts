export function formatTime(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const SEVENEIGHTFIVE_ORIGIN = "https://seveneightfive.com";

export function artistProfileUrl(slug: string | null | undefined): string {
  return `${SEVENEIGHTFIVE_ORIGIN}/artist/${slug ?? ""}`;
}
