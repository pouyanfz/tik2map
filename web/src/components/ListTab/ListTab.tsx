import { useRef, useState } from "react";
import { PlaceDetailSheet } from "../MapTab/PlaceDetailSheet";
import { SwipeablePlaceCard } from "./SwipeablePlaceCard";
import { savePlace, deletePlace } from "../../lib/functions";
import type { Place } from "../../types";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ListTabProps {
  places: Place[];
  placesLoading: boolean;
  onImported?: (places: { lat: number; lng: number }[]) => void;
}

export function ListTab({ places, placesLoading, onImported }: ListTabProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const data = places.map((p) => ({
      tiktokUrl: p.tiktokUrl,
      placeName: p.placeName,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      placeId: p.placeId,
      category: p.category,
      note: p.note ?? "",
      tags: p.tags ?? [],
      occasion: p.occasion ?? [],
      cuisine: p.cuisine ?? "",
      thumbnailUrl: p.thumbnailUrl ?? null,
    }));
    downloadJson(`tik2map-export-${new Date().toISOString().slice(0, 10)}.json`, data);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportStatus(null);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("not an array");

      // De-dupe by placeId within the file itself before firing saves
      // concurrently - each save's own "already exists" check only guards
      // against places already in Firestore, not against two saves of the
      // same new placeId racing each other within this same batch.
      const seenPlaceIds = new Set<string>();
      const uniqueEntries = parsed.filter((entry) => {
        if (seenPlaceIds.has(entry.placeId)) return false;
        seenPlaceIds.add(entry.placeId);
        return true;
      });
      const withinBatchDuplicates = parsed.length - uniqueEntries.length;

      const results = await Promise.allSettled(
        uniqueEntries.map((entry) =>
          savePlace({
            tiktokUrl: entry.tiktokUrl ?? "",
            placeName: entry.placeName,
            address: entry.address,
            lat: entry.lat,
            lng: entry.lng,
            placeId: entry.placeId,
            category: entry.category,
            note: entry.note || undefined,
            tags: entry.tags?.length ? entry.tags : undefined,
            occasion: entry.occasion?.length ? entry.occasion : undefined,
            cuisine: entry.cuisine || undefined,
            thumbnailUrl: entry.thumbnailUrl || undefined,
          })
        )
      );

      let imported = 0;
      let skipped = withinBatchDuplicates;
      let failed = 0;
      const importedCoords: { lat: number; lng: number }[] = [];

      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          imported++;
          importedCoords.push({ lat: uniqueEntries[i].lat, lng: uniqueEntries[i].lng });
          return;
        }
        const code = (result.reason as { code?: string })?.code ?? "";
        if (code.includes("already-exists")) {
          skipped++;
        } else {
          failed++;
        }
      });

      setImportStatus(
        `Imported ${imported}, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}${
          failed ? `, ${failed} failed` : ""
        }.`
      );
      if (importedCoords.length > 0) onImported?.(importedCoords);
    } catch {
      setImportStatus("Couldn't read that file - make sure it's a Tik2Map export.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="list-tab">
      <div className="list-tab__header">
        <h2>Your places</h2>
        <div className="list-tab__actions">
          <button type="button" onClick={handleExport} disabled={places.length === 0}>
            Export
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? "Importing..." : "Import"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
        </div>
      </div>
      {importStatus && <p className="list-tab__import-status">{importStatus}</p>}

      {placesLoading && <p>Loading...</p>}
      {!placesLoading && places.length === 0 && <p>Saved places will appear here.</p>}

      <div className="place-list">
        {places.map((place) => (
          <SwipeablePlaceCard
            key={place.id}
            place={place}
            onOpenDetail={() => setSelectedPlace(place)}
            onDelete={async () => {
              await deletePlace(place.id);
            }}
          />
        ))}
      </div>

      {selectedPlace && <PlaceDetailSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
    </div>
  );
}
