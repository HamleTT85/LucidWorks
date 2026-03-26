/**
 * Parse a Vimeo or YouTube URL and return the video type and embed ID
 */
export function parseVideoUrl(url: string): { type: 'vimeo' | 'youtube'; id: string } | null {
  // Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeoMatch) {
    return { type: 'vimeo', id: vimeoMatch[1] };
  }

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return { type: 'youtube', id: ytMatch[1] };
  }

  return null;
}

/**
 * Format a date string to "MMM YYYY" or "MM/YYYY"
 */
export function formatDate(dateStr: string | null, lang: 'de' | 'en' = 'en'): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Validate that a URL is a valid Vimeo or YouTube link
 */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a Vimeo embed URL
 */
export function getVimeoEmbedUrl(id: string): string {
  return `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0&portrait=0`;
}

/**
 * Generate a YouTube embed URL (privacy-enhanced)
 */
export function getYouTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}
