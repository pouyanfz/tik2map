import { useState } from "react";
import { resolvePlaceFromTikTok } from "../../lib/functions";
import { ConfirmModal } from "./ConfirmModal";
import type { ResolvePlaceResponse } from "../../types";

type Status = "idle" | "resolving" | "error";

interface AddTabProps {
  onPlaceSaved: (place: { lat: number; lng: number }) => void;
}

export function AddTab({ onPlaceSaved }: AddTabProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ResolvePlaceResponse | null>(null);

  async function handleSubmit() {
    if (!url.trim()) return;
    setStatus("resolving");
    setErrorMessage(null);
    try {
      const res = await resolvePlaceFromTikTok(url.trim());
      setResult(res);
      setStatus("idle");
    } catch {
      setErrorMessage("Couldn't resolve this link. Check the URL and try again.");
      setStatus("error");
    }
  }

  function handleModalClose() {
    setResult(null);
  }

  function handleSaved(place: { lat: number; lng: number }) {
    setResult(null);
    setUrl("");
    setStatus("idle");
    onPlaceSaved(place);
  }

  return (
    <div className="add-tab">
      <h2>Add a place</h2>
      <p>Paste a TikTok link below.</p>
      <input
        className="add-tab__input"
        type="url"
        placeholder="https://www.tiktok.com/@user/video/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={status === "resolving"}
      />
      <button className="add-tab__submit-btn" onClick={handleSubmit} disabled={status === "resolving" || !url.trim()}>
        {status === "resolving" ? "Resolving..." : "Resolve place"}
      </button>

      {status === "error" && (
        <div className="add-tab__error">
          {errorMessage}
          <button type="button" className="add-tab__retry-btn" onClick={handleSubmit}>
            Retry
          </button>
        </div>
      )}

      {result && (
        <ConfirmModal
          tiktokUrl={result.tiktokUrl}
          thumbnailUrl={result.thumbnailUrl}
          extracted={result.extracted}
          resolved={result.resolved}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
