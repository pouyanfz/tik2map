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
  const oembedCaption = data.title?.trim();
  if (oembedCaption) {
    return { caption: oembedCaption, thumbnailUrl: data.thumbnail_url ?? null };
  }

  // TikTok's oEmbed response stopped including `title`/`thumbnail_url`
  // (it now only returns a player iframe), so fall back to reading the
  // caption from the video page's embedded rehydration JSON.
  const fromPage = await fetchCaptionFromVideoPage(tiktokUrl);
  if (!fromPage.caption) {
    throw new Error("This TikTok video doesn't have a caption to read a place from.");
  }
  return fromPage;
}

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const REHYDRATION_SCRIPT_RE =
  /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/;

interface VideoDetail {
  statusCode?: number;
  itemInfo?: {
    itemStruct?: {
      desc?: string;
      video?: { cover?: string; originCover?: string };
    };
  };
}

/**
 * Reads the caption (and cover image) from the public TikTok video page.
 * Short links (vm.tiktok.com / tiktok.com/t/...) are resolved by following
 * redirects.
 */
async function fetchCaptionFromVideoPage(tiktokUrl: string): Promise<TikTokOEmbed> {
  let res: Response;
  try {
    res = await fetch(tiktokUrl, {
      headers: { "User-Agent": BROWSER_USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("TikTok took too long to respond. Please try again.");
    }
    throw new Error(`Could not reach TikTok: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new Error(`TikTok video page request failed: ${res.status} ${res.statusText}`);
  }

  const match = REHYDRATION_SCRIPT_RE.exec(await res.text());
  if (!match) {
    throw new Error("Couldn't read the caption from TikTok's video page (page format may have changed).");
  }

  let detail: VideoDetail | undefined;
  try {
    detail = JSON.parse(match[1])?.__DEFAULT_SCOPE__?.["webapp.video-detail"];
  } catch {
    throw new Error("Couldn't parse TikTok's video page data.");
  }
  if (!detail?.itemInfo?.itemStruct) {
    throw new Error("TikTok couldn't find this video. Check the link is correct and the video is public.");
  }

  const item = detail.itemInfo.itemStruct;
  return {
    caption: item.desc?.trim() ?? "",
    thumbnailUrl: item.video?.originCover || item.video?.cover || null,
  };
}
