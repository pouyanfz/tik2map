import type { MouseEvent, ReactNode } from "react";

interface ModalOverlayProps {
  onClose: () => void;
  children: ReactNode;
}

// The overlay stops its own click from bubbling before calling onClose, not
// just for its own sake, but so that a modal nested inside another modal's
// overlay (e.g. CuisinePickerModal opened from within ConfirmModal) doesn't
// close its parent too - a click on the nested overlay never reaches the
// parent's onClick handler.
export function ModalOverlay({ onClose, children }: ModalOverlayProps) {
  function handleOverlayClick(e: MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {children}
    </div>
  );
}

interface ModalBoxProps {
  children: ReactNode;
  className?: string;
}

export function ModalBox({ children, className }: ModalBoxProps) {
  return (
    <div className={className ? `modal ${className}` : "modal"} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
