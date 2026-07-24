/**
 * Isolated test for Google Places Text Search, run standalone (no Firebase needed).
 * Usage: PLACES_API_KEY=xxx npm run test:places -- "<place name / query>"
 */
import { resolvePlace } from "../src/services/places";

async function main() {
  const query = process.argv[2];
  const apiKey = process.env.PLACES_API_KEY;

  if (!query) {
    console.error('Usage: PLACES_API_KEY=xxx npm run test:places -- "<place name>"');
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Missing PLACES_API_KEY environment variable.");
    process.exit(1);
  }

  const resolved = await resolvePlace(query, apiKey);
  console.log("Resolved:", resolved);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
