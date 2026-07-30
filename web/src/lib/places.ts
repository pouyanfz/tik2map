import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { Place } from "../types";

export function usePlaces(): { places: Place[]; loading: boolean } {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "places"), (snapshot) => {
      setPlaces(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Place)
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { places, loading };
}
