import { CUISINE_OPTIONS } from "../../lib/cuisines";
import { ModalOverlay, ModalBox } from "./ModalOverlay";

interface CuisinePickerModalProps {
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function CuisinePickerModal({ selected, onSelect, onClose }: CuisinePickerModalProps) {
  function handlePick(id: string) {
    onSelect(id === selected ? "" : id);
    onClose();
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalBox>
        <h2>Select cuisine</h2>
        <div className="cuisine-grid">
          {CUISINE_OPTIONS.map((c) => (
            <button
              type="button"
              key={c.id}
              className={c.id === selected ? "cuisine-card cuisine-card--selected" : "cuisine-card"}
              onClick={() => handlePick(c.id)}
            >
              <span className="cuisine-card__flag">{c.flag}</span>
              <span className="cuisine-card__label">{c.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="modal__cancel-btn" onClick={onClose}>
          Close
        </button>
      </ModalBox>
    </ModalOverlay>
  );
}
