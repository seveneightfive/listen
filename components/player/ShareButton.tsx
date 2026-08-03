"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({
  title,
  text,
  url,
  className = "",
}: {
  title: string;
  text?: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled the share sheet — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this track"
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-[--text] transition hover:border-white/30 hover:bg-white/5 ${className}`}
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
