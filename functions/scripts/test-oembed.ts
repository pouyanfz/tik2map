/**
 * Isolated test for the TikTok oEmbed fetch, run standalone (no Firebase needed).
 * Usage: npm run test:oembed -- "<tiktok url>"
 */
import { fetchTikTokCaption } from "../src/services/oembed";

async function main() {
  const tiktokUrl = process.argv[2];
  if (!tiktokUrl) {
    console.error('Usage: npm run test:oembed -- "<tiktok url>"');
    process.exit(1);
  }

  const { caption, thumbnailUrl } = await fetchTikTokCaption(tiktokUrl);
  console.log("Caption:", caption);
  console.log("Thumbnail URL:", thumbnailUrl);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
