import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
    // Re-arm only when the message itself changes, not on every re-render
    // (onDismiss is often a fresh closure from the parent each render).
  }, [message]);

  return <div className="toast">{message}</div>;
}
