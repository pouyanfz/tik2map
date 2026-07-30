import { ChipSelect } from "../shared/ChipSelect";
import { TAG_OPTIONS, OCCASION_OPTIONS } from "../../lib/tags";
import { CUISINE_OPTIONS } from "../../lib/cuisines";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedTags: string[];
  selectedOccasions: string[];
  selectedCategories: string[];
  selectedCuisines: string[];
  onToggleTag: (id: string) => void;
  onToggleOccasion: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onToggleCuisine: (id: string) => void;
  onClear: () => void;
}

export function FilterPanel({
  isOpen,
  onClose,
  categories,
  selectedTags,
  selectedOccasions,
  selectedCategories,
  selectedCuisines,
  onToggleTag,
  onToggleOccasion,
  onToggleCategory,
  onToggleCuisine,
  onClear,
}: FilterPanelProps) {
  return (
    <>
      {isOpen && <div className="filter-backdrop" onClick={onClose} />}
      <div className={isOpen ? "filter-panel filter-panel--open" : "filter-panel"}>
        <div className="filter-panel__header">
          <h2>Filter</h2>
        </div>

        <div className="filter-panel__section">
          <h3>Tags</h3>
          <ChipSelect options={TAG_OPTIONS} selected={selectedTags} onToggle={onToggleTag} />
        </div>

        <div className="filter-panel__section">
          <h3>Occasion</h3>
          <ChipSelect options={OCCASION_OPTIONS} selected={selectedOccasions} onToggle={onToggleOccasion} />
        </div>

        <div className="filter-panel__section">
          <h3>Cuisine</h3>
          <ChipSelect
            options={CUISINE_OPTIONS.map((c) => ({ id: c.id, label: c.label, icon: c.flag }))}
            selected={selectedCuisines}
            onToggle={onToggleCuisine}
          />
        </div>

        {categories.length > 0 && (
          <div className="filter-panel__section">
            <h3>Category</h3>
            <ChipSelect
              options={categories.map((c) => ({ id: c, label: c }))}
              selected={selectedCategories}
              onToggle={onToggleCategory}
            />
          </div>
        )}

        <div className="modal__actions">
          <button type="button" className="modal__cancel-btn" onClick={onClose}>
            Close
          </button>
          <button type="button" className="filter-panel__clear-btn" onClick={onClear}>
            Clear filters
          </button>
        </div>
      </div>
    </>
  );
}
