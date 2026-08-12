import { useState } from "react";
import { searchPlace, savePlace } from "../../lib/functions";
import { MiniMap } from "../shared/MiniMap";
import { ChipSelect } from "../shared/ChipSelect";
import { ModalOverlay, ModalBox } from "../shared/ModalOverlay";
import { TAG_OPTIONS, OCCASION_OPTIONS } from "../../lib/tags";
import { getCuisineOption } from "../../lib/cuisines";
import { CuisinePickerModal } from "../shared/CuisinePickerModal";
import { toggleId } from "../../lib/arrayUtils";
import type { ExtractedPlace, ResolvedPlace } from "../../types";

interface ConfirmModalProps {
  tiktokUrl: string;
  thumbnailUrl: string | null;
  extracted: ExtractedPlace | null;
  candidates: ResolvedPlace[];
  onClose: () => void;
  onSaved: (place: { lat: number; lng: number }) => void;
}

export function ConfirmModal({
  tiktokUrl,
  thumbnailUrl,
  extracted,
  candidates,
  onClose,
  onSaved,
}: ConfirmModalProps) {
  const topMatch = candidates[0] ?? null;
  const [placeName, setPlaceName] = useState(topMatch?.placeName ?? extracted?.placeName ?? "");
  const [address, setAddress] = useState(topMatch?.address ?? extracted?.address ?? "");
  const [coords, setCoords] = useState<ResolvedPlace | null>(topMatch);
  // Places API text search is fuzzy - a caption's guess at a name doesn't
  // always match the business's real listing (e.g. "Grizzly Bear
  // Restaurant" in the caption vs. the actual "Grizzly Bar"). Surfacing
  // every candidate it returned lets the user pick the right one instead of
  // having to retype the exact listed name until it happens to match.
  const [candidateList, setCandidateList] = useState<ResolvedPlace[]>(candidates);
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState("");
  const [cuisinePickerOpen, setCuisinePickerOpen] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const notVerified = coords === null;
  const lowConfidence = !notVerified && extracted !== null && !extracted.address;
  const nameMismatch = coords !== null && placeName.trim() !== coords.placeName;

  async function handleSearch() {
    if (!placeName.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const query = address.trim() ? `${placeName.trim()}, ${address.trim()}` : placeName.trim();
      const { candidates: found } = await searchPlace(query);
      setCandidateList(found);
      const top = found[0] ?? null;
      if (!top) {
        setSearchError("No matching place found. Try adjusting the name, or add a city/neighborhood.");
        setCoords(null);
        return;
      }
      selectCandidate(top);
    } catch (err) {
      setSearchError((err as { message?: string })?.message || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function selectCandidate(candidate: ResolvedPlace) {
    setCoords(candidate);
    setPlaceName(candidate.placeName);
    setAddress(candidate.address);
  }

  async function handleSave() {
    if (!coords) return;
    setSaving(true);
    setSaveError(null);
    try {
      await savePlace({
        tiktokUrl,
        placeName: placeName.trim(),
        address: address.trim(),
        lat: coords.lat,
        lng: coords.lng,
        placeId: coords.placeId,
        category: coords.category,
        note: note.trim() || undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        occasion: selectedOccasions.length ? selectedOccasions : undefined,
        cuisine: cuisine || undefined,
        thumbnailUrl,
      });
      onSaved({ lat: coords.lat, lng: coords.lng });
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      const message = (err as { message?: string })?.message;
      setSaveError(
        code.includes("already-exists")
          ? "This place is already saved to your map."
          : message || "Save failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalBox>
        <h2>Confirm place</h2>

        <div className="modal__source">
          {thumbnailUrl && !thumbnailFailed && (
            <img
              src={thumbnailUrl}
              alt=""
              className="modal__thumbnail"
              referrerPolicy="no-referrer"
              onError={() => setThumbnailFailed(true)}
            />
          )}
          <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="modal__source-link">
            {tiktokUrl}
          </a>
        </div>

        {notVerified && (
          <div className="modal__warning">
            ⚠️ Couldn't verify this location automatically. Enter a name below and search.
          </div>
        )}
        {lowConfidence && (
          <div className="modal__warning">
            ⚠️ Only found a name in the caption — double-check this looks right.
          </div>
        )}

        <label className="modal__field">
          Place name
          <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="e.g. Neate Donuts" />
        </label>

        <label className="modal__field">
          Address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Vancouver, BC (optional hint before searching)"
          />
        </label>

        <button
          type="button"
          className="modal__search-btn"
          onClick={handleSearch}
          disabled={searching || !placeName.trim()}
        >
          {searching ? "Searching..." : coords ? "Search again" : "Search"}
        </button>
        {searchError && <div className="modal__error">{searchError}</div>}
        {candidateList.length > 1 && (
          <div className="modal__candidates">
            <div className="modal__candidates-label">Did you mean one of these?</div>
            {candidateList.map((candidate) => (
              <button
                type="button"
                key={candidate.placeId}
                className={
                  "modal__candidate" +
                  (coords?.placeId === candidate.placeId ? " modal__candidate--selected" : "")
                }
                onClick={() => selectCandidate(candidate)}
              >
                <span className="modal__candidate-name">{candidate.placeName}</span>
                <span className="modal__candidate-address">{candidate.address}</span>
              </button>
            ))}
          </div>
        )}
        {coords && !searchError && (
          <>
            <div className="modal__success">✓ Location verified</div>
            <MiniMap lat={coords.lat} lng={coords.lng} label={coords.placeName} />
            {nameMismatch && (
              <div className="modal__warning">
                ⚠️ The verified location is called "{coords.placeName}" — your edited name doesn't match.
                Hit "Search again" to re-verify, or save anyway if you're intentionally using a different
                label.
              </div>
            )}
          </>
        )}

        <label className="modal__field">
          Note <span className="modal__optional">(optional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </label>

        <div className="modal__field">
          Tags <span className="modal__optional">(optional)</span>
          <ChipSelect options={TAG_OPTIONS} selected={selectedTags} onToggle={(id) => setSelectedTags((prev) => toggleId(prev, id))} />
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
          <button type="button" className="modal__cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="modal__save-btn" onClick={handleSave} disabled={!coords || saving}>
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
