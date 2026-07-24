import { useState } from "react";
import { TabNav } from "./components/TabNav/TabNav";
import { MapView } from "./components/MapTab/MapView";
import { AddTab } from "./components/AddTab/AddTab";
import { ListTab } from "./components/ListTab/ListTab";
import type { TabId } from "./types";

export function App() {
  const [tab, setTab] = useState<TabId>("map");

  return (
    <div className="app">
      <main className="app__content">
        {tab === "map" && <MapView />}
        {tab === "add" && <AddTab />}
        {tab === "list" && <ListTab />}
      </main>
      <TabNav active={tab} onChange={setTab} />
    </div>
  );
}
