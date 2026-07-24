/**
 * Fetches the caption/description text for a TikTok video via TikTok's public
 * oEmbed endpoint. No API key required.
 */
export async function fetchTikTokCaption(tiktokUrl: string): Promise<string> {
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`TikTok oEmbed request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { title?: string };
  const caption = data.title?.trim();

  if (!caption) {
    throw new Error("TikTok oEmbed response did not include a caption/title.");
  }

  return caption;
}
