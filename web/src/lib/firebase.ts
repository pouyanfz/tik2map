import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Point at local emulators during dev so the Add tab works without a real
// deployment. Set VITE_USE_FIREBASE_EMULATOR=false to opt out.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== "false") {
  // Use whatever host loaded the page (not a hardcoded 127.0.0.1) so this
  // also works when a phone on the same network opens the laptop's LAN IP
  // (e.g. via `npm run dev -- --host`) instead of localhost.
  const emulatorHost = window.location.hostname;
  connectFirestoreEmulator(db, emulatorHost, 8080);
  connectFunctionsEmulator(functions, emulatorHost, 5001);
}
