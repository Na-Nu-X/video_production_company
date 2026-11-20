/** Hosts we trust to be rendered inside an <iframe>. */
const ALLOWED_EMBED_PREFIXES = [
  'https://www.youtube.com/embed/',
  'https://www.youtube-nocookie.com/embed/',
  'https://player.vimeo.com/video/',
] as const;

export function isTrustedEmbedUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const normalized = `${parsed.origin}${parsed.pathname}`;
    return ALLOWED_EMBED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
  } catch {
    return false;
  }
}

/**
 * Returns a privacy-friendlier, autoplay-ready embed URL, or `null` when the
 * URL is not from an allowed video host.
 */
export function buildEmbedUrl(url: string, { autoplay = false } = {}): string | null {
  if (!isTrustedEmbedUrl(url)) return null;
  const parsed = new URL(url.replace('https://www.youtube.com/', 'https://www.youtube-nocookie.com/'));
  if (parsed.hostname.includes('youtube')) {
    parsed.searchParams.set('rel', '0');
    parsed.searchParams.set('modestbranding', '1');
    parsed.searchParams.set('playsinline', '1');
  } else {
    parsed.searchParams.set('title', '0');
    parsed.searchParams.set('byline', '0');
    parsed.searchParams.set('portrait', '0');
  }
  if (autoplay) parsed.searchParams.set('autoplay', '1');
  return parsed.toString();
}
