export interface TikTokOEmbed {
  caption: string;
  thumbnailUrl: string | null;
}

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Fetches the caption/description text (and thumbnail, if present) for a
 * TikTok video via TikTok's public oEmbed endpoint. No API key required.
 */
export async function fetchTikTokCaption(tiktokUrl: string): Promise<TikTokOEmbed> {
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;

  let res: Response;
  try {
    res = await fetch(endpoint, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("TikTok took too long to respond. Please try again.");
    }
    throw new Error(`Could not reach TikTok: ${(err as Error).message}`);
  }

  if (res.status === 404) {
    throw new Error("TikTok couldn't find this video. Check the link is correct and the video is public.");
  }
  if (!res.ok) {
    throw new Error(`TikTok oEmbed request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { title?: string; thumbnail_url?: string };
  const caption = data.title?.trim();

  if (!caption) {
    throw new Error("This TikTok video doesn't have a caption to read a place from.");
  }

  return { caption, thumbnailUrl: data.thumbnail_url ?? null };
}
