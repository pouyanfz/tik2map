import { useState } from "react";

// Stub: input + submit are wired up, but the resolvePlaceFromTikTok call and
// confirmation modal come in a follow-up pass (build order step 3).
export function AddTab() {
  const [url, setUrl] = useState("");

  return (
    <div className="add-tab">
      <h2>Add a place</h2>
      <p>Paste a TikTok link below.</p>
      <input
        type="url"
        placeholder="https://www.tiktok.com/@user/video/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button disabled>Resolve place (coming soon)</button>
    </div>
  );
}
