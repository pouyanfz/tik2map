/**
 * Isolated read/write test against the Firestore emulator (never production).
 * Usage:
 *   firebase emulators:start --only firestore   (in one terminal)
 *   npm run test:firestore                       (in another)
 */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";

async function main() {
  initializeApp({ projectId: "tik2map" });
  const db = getFirestore();

  const docRef = await db.collection("places").add({
    tiktokUrl: "https://www.tiktok.com/@test/video/000",
    placeName: "Test Cafe",
    address: "123 Test St",
    lat: 40.7128,
    lng: -74.006,
    placeId: "test-place-id",
    category: "cafe",
    note: "isolation test doc",
    tags: [],
    occasion: "",
    createdAt: new Date(),
  });
  console.log("Wrote doc:", docRef.id);

  const snapshot = await docRef.get();
  console.log("Read back:", snapshot.data());

  await docRef.delete();
  console.log("Cleaned up test doc.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
