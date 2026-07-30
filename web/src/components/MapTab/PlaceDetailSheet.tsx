import { useState } from "react";
import { TAG_OPTIONS, OCCASION_OPTIONS, getOccasionLabel } from "../../lib/tags";
import { getCuisineOption } from "../../lib/cuisines";
import { ChipSelect } from "../shared/ChipSelect";
import { CuisinePickerModal } from "../shared/CuisinePickerModal";
import { ModalOverlay, ModalBox } from "../shared/ModalOverlay";
import { TagChip } from "../shared/TagChip";
import { toggleId } from "../../lib/arrayUtils";
import { updatePlace } from "../../lib/functions";
import {
  googleMapsViewUrl,
  googleMapsDirectionsUrl,
  appleMapsViewUrl,
  appleMapsDirectionsUrl,
} from "../../lib/deepLinks";
import type { Place } from "../../types";

interface PlaceDetailSheetProps {
  place: Place;
  onClose: () => void;
}

export function PlaceDetailSheet({ place, onClose }: PlaceDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [placeName, setPlaceName] = useState(place.placeName);
  const [note, setNote] = useState(place.note ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(place.tags ?? []);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(place.occasion ?? []);
  const [cuisine, setCuisine] = useState(place.cuisine ?? "");
  const [cuisinePickerOpen, setCuisinePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  async function handleSaveEdit() {
    setSaving(true);
    setSaveError(null);
    try {
      await updatePlace({
        id: place.id,
        placeName: placeName.trim(),
        note: note.trim(),
        tags: selectedTags,
        occasion: selectedOccasions,
        cuisine,
      });
      onClose();
    } catch {
      setSaveError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (isEditing) {
    return (
      <ModalOverlay onClose={onClose}>
        <ModalBox>
          <h2>Edit place</h2>

          <label className="modal__field">
            Place name
            <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
          </label>

          <label className="modal__field">
            Note <span className="modal__optional">(optional)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </label>

          <div className="modal__field">
            Tags <span className="modal__optional">(optional)</span>
            <ChipSelect
              options={TAG_OPTIONS}
              selected={selectedTags}
              onToggle={(id) => setSelectedTags((prev) => toggleId(prev, id))}
            />
          </div>

          <div className="modal__field">
            Occasion <span className="modal__optional">(optional)</span>
            <ChipSelect
              options={OCCASION_OPTIONS}
              selected={selectedOccasions}
              onToggle={(id) => setSelectedOccasions((prev) => toggleId(prev, id))}
            />
          </div>

          <div className="modal__field">
            Cuisine <span className="modal__optional">(optional)</span>
            <button type="button" className="cuisine-picker-btn" onClick={() => setCuisinePickerOpen(true)}>
              <span>
                {cuisine
                  ? `${getCuisineOption(cuisine)?.flag} ${getCuisineOption(cuisine)?.label}`
                  : "Select cuisine"}
              </span>
              <span className="cuisine-picker-btn__chevron">▾</span>
            </button>
          </div>

          {saveError && <div className="modal__error">{saveError}</div>}

          <div className="modal__actions">
            <button type="button" className="modal__cancel-btn" onClick={() => setIsEditing(false)} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="modal__save-btn" onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </ModalBox>

        {cuisinePickerOpen && (
          <CuisinePickerModal
            selected={cuisine}
            onSelect={setCuisine}
            onClose={() => setCuisinePickerOpen(false)}
          />
        )}
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalBox>
        <h2>{place.placeName}</h2>
        <p className="detail__address">{place.address}</p>

        {place.note && <p className="detail__note">{place.note}</p>}

        {!!place.tags?.length && (
          <div className="chip-row detail__chips">
            {place.tags.map((tagId) => (
              <TagChip key={tagId} tagId={tagId} />
            ))}
          </div>
        )}

        {!!place.occasion?.length && (
          <div className="chip-row detail__chips">
            {place.occasion.map((occasionId) => (
              <span key={occasionId} className="chip">
                {getOccasionLabel(occasionId)}
              </span>
            ))}
          </div>
        )}

        {place.cuisine && (
          <div className="chip-row detail__chips">
            <span className="chip">
              {getCuisineOption(place.cuisine)?.flag} {getCuisineOption(place.cuisine)?.label ?? place.cuisine}
            </span>
          </div>
        )}

        <div className="modal__source">
          {place.thumbnailUrl && !thumbnailFailed && (
            <img
              src={place.thumbnailUrl}
              alt=""
              className="modal__thumbnail"
              referrerPolicy="no-referrer"
              onError={() => setThumbnailFailed(true)}
            />
          )}
          <a href={place.tiktokUrl} target="_blank" rel="noopener noreferrer" className="detail__source-link">
            View original TikTok
          </a>
        </div>

        <div className="detail__links">
          <a href={googleMapsViewUrl(place)} target="_blank" rel="noopener noreferrer" className="detail__link-btn">
            Open in Google Maps
          </a>
          <a
            href={googleMapsDirectionsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="detail__link-btn"
          >
            Directions (Google)
          </a>
          <a href={appleMapsViewUrl(place)} target="_blank" rel="noopener noreferrer" className="detail__link-btn">
            Open in Apple Maps
          </a>
          <a
            href={appleMapsDirectionsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="detail__link-btn"
          >
            Directions (Apple)
          </a>
        </div>

        <div className="modal__actions">
          <button type="button" className="modal__cancel-btn" onClick={onClose}>
            Close
          </button>
          <button type="button" className="modal__save-btn" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}
