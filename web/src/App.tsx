import { useState } from "react";
import { TabNav } from "./components/TabNav/TabNav";
import { MapView } from "./components/MapTab/MapView";
import { AddTab } from "./components/AddTab/AddTab";
import { ListTab } from "./components/ListTab/ListTab";
import { Toast } from "./components/shared/Toast";
import { usePlaces } from "./lib/places";
import type { CameraAction, TabId } from "./types";

const TAB_ORDER: TabId[] = ["map", "add", "list"];

export function App() {
  const [tab, setTab] = useState<TabId>("map");
  const [cameraAction, setCameraAction] = useState<CameraAction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Lifted here (rather than each of MapView/ListTab calling usePlaces()
  // independently) since both tabs stay permanently mounted in the
  // carousel below - two independent Firestore listeners on the same
  // collection would otherwise run for the whole session.
  const { places, loading: placesLoading } = usePlaces();

  function handlePlaceSaved(place: { lat: number; lng: number }) {
    setCameraAction({ type: "focus", lat: place.lat, lng: place.lng });
    setToastMessage("Added to map!");
    setTab("map");
  }

  function handleImported(importedPlaces: { lat: number; lng: number }[]) {
    setCameraAction({ type: "fit", places: importedPlaces });
  }

  const activeIndex = TAB_ORDER.indexOf(tab);

  return (
    <div className="app">
      <main className="app__content">
        {/* All three panels stay mounted (not conditionally rendered) so
            switching tabs is a slide of this row rather than a remount -
            preserves Map's Mapbox instance/geolocation state and Add's
            in-progress input across visits. Animates `left`, not
            `transform`, since a transformed ancestor becomes the
            containing block for `position: fixed` descendants and would
            break the full-viewport modals rendered inside each tab. `left`
            percentages resolve against the containing block (this panel's
            parent, .app__content) for a position:relative element - unlike
            transform's percentages, which resolve against the element's own
            box - so one panel-width shift is 100% per step, not 100/3%. */}
        <div className="tab-carousel" style={{ left: `-${activeIndex * 100}%` }}>
          <div className="tab-panel">
            <MapView places={places} placesLoading={placesLoading} cameraAction={cameraAction} />
          </div>
          <div className="tab-panel">
            <AddTab onPlaceSaved={handlePlaceSaved} />
          </div>
          <div className="tab-panel">
            <ListTab places={places} placesLoading={placesLoading} onImported={handleImported} />
          </div>
        </div>
      </main>
      <TabNav active={tab} onChange={setTab} />
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
