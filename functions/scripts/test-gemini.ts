/**
 * Isolated test for Gemini extraction, run standalone (no Firebase needed).
 * Usage: GEMINI_API_KEY=xxx npm run test:gemini -- "<sample caption text>"
 */
import { extractPlaceFromCaption } from "../src/services/gemini";

async function main() {
  const caption = process.argv[2];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!caption) {
    console.error('Usage: GEMINI_API_KEY=xxx npm run test:gemini -- "<caption text>"');
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable.");
    process.exit(1);
  }

  const extracted = await extractPlaceFromCaption(caption, apiKey);
  console.log("Extracted:", extracted);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
