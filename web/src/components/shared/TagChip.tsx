import { TAG_OPTIONS } from "../../lib/tags";

export function TagChip({ tagId }: { tagId: string }) {
  const tag = TAG_OPTIONS.find((t) => t.id === tagId);
  return (
    <span
      className="chip chip--selected"
      style={{ background: tag?.color ?? "#7a7a7a", borderColor: tag?.color ?? "#7a7a7a", color: "#fff" }}
    >
      {tag?.icon} {tag?.label ?? tagId}
    </span>
  );
}
