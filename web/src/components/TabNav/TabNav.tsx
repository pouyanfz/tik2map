import type { TabId } from "../../types";

const TABS: { id: TabId; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "add", label: "Add" },
  { id: "list", label: "List" },
];

interface TabNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="tab-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === active ? "tab-nav__item tab-nav__item--active" : "tab-nav__item"}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
