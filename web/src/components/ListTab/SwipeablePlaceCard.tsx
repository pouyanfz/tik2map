import { useRef, useState } from "react";
import { getOccasionLabel } from "../../lib/tags";
import { getCuisineOption } from "../../lib/cuisines";
import { ModalOverlay, ModalBox } from "../shared/ModalOverlay";
import { TagChip } from "../shared/TagChip";
import type { Place } from "../../types";

const REVEAL_WIDTH = 88;
const DRAG_THRESHOLD = 10;

interface SwipeablePlaceCardProps {
  place: Place;
  onOpenDetail: () => void;
  onDelete: () => Promise<void>;
}

export function SwipeablePlaceCard({ place, onOpenDetail, onDelete }: SwipeablePlaceCardProps) {
  const [dragX, setDragX] = useState(0);
  // Only ever rests at 0 or -REVEAL_WIDTH when not dragging - no need for a
  // separate state variable kept manually in sync with dragX.
  const revealed = dragX !== 0;
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startXRef = useRef(0);
  const startTranslateRef = useRef(0);
  const movedRef = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX;
    startTranslateRef.current = revealed ? -REVEAL_WIDTH : 0;
    movedRef.current = false;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) movedRef.current = true;
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, startTranslateRef.current + delta));
    setDragX(next);
  }

  function handlePointerUp() {
    setDragging(false);
    if (!movedRef.current) {
      if (revealed) {
        setDragX(0);
      } else {
        onOpenDetail();
      }
      return;
    }
    const shouldReveal = dragX < -REVEAL_WIDTH / 2;
    setDragX(shouldReveal ? -REVEAL_WIDTH : 0);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="place-card-wrapper">
      <button
        type="button"
        className="place-card-delete-btn"
        style={{ width: REVEAL_WIDTH }}
        onClick={() => setConfirming(true)}
      >
        Delete
      </button>

      <div
        className="place-card"
        style={{ transform: `translateX(${dragX}px)`, transition: dragging ? "none" : "transform 0.2s ease" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="place-card__name">{place.placeName}</div>
        <div className="place-card__address">{place.address}</div>
        {place.note && <div className="place-card__note">{place.note}</div>}
        <div className="chip-row">
          {place.tags?.map((tagId) => (
            <TagChip key={tagId} tagId={tagId} />
          ))}
          {place.occasion?.map((occasionId) => (
            <span key={occasionId} className="chip">
              {getOccasionLabel(occasionId)}
            </span>
          ))}
          {place.cuisine && (
            <span className="chip">
              {getCuisineOption(place.cuisine)?.flag} {getCuisineOption(place.cuisine)?.label}
            </span>
          )}
        </div>
      </div>

      {confirming && (
        <ModalOverlay onClose={() => !deleting && setConfirming(false)}>
          <ModalBox>
            <h2>Delete this place?</h2>
            <p className="detail__address">{place.placeName}</p>
            <div className="modal__actions">
              <button
                type="button"
                className="modal__cancel-btn"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button type="button" className="place-card-delete-confirm-btn" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}
    </div>
  );
}
