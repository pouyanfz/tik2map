export interface TagOption {
  id: string;
  label: string;
  color: string;
  icon: string;
}

// Fixed order, never cycled/reordered - see the dataviz skill's categorical
// palette validation notes in the plan for why this exact set/order was chosen.
export const TAG_OPTIONS: TagOption[] = [
  { id: "restaurant", label: "Restaurant", color: "#2a78d6", icon: "🍽️" },
  { id: "cafe", label: "Cafe", color: "#eb6834", icon: "☕" },
  { id: "bakery", label: "Bakery", color: "#1baf7a", icon: "🥐" },
  { id: "bar", label: "Bar", color: "#eda100", icon: "🍹" },
  { id: "dessert", label: "Dessert", color: "#e87ba4", icon: "🍰" },
  { id: "fast_food", label: "Fast Food", color: "#008300", icon: "🍔" },
  { id: "fine_dining", label: "Fine Dining", color: "#4a3aa7", icon: "🍷" },
  { id: "other", label: "Other", color: "#e34948", icon: "📍" },
];

export const OCCASION_OPTIONS: { id: string; label: string }[] = [
  { id: "date_idea", label: "Date idea" },
  { id: "casual", label: "Casual" },
  { id: "bougie", label: "Bougie" },
  { id: "snack", label: "Snack" },
  { id: "group_hangout", label: "Group hangout" },
  { id: "solo", label: "Solo" },
];

const NEUTRAL_TAG_STYLE = { color: "#7a7a7a", icon: "📍" };

export function getTagStyle(tagIds: string[] | undefined): { color: string; icon: string } {
  const firstTag = tagIds?.[0];
  const option = TAG_OPTIONS.find((t) => t.id === firstTag);
  return option ? { color: option.color, icon: option.icon } : NEUTRAL_TAG_STYLE;
}

export function getTagLabel(tagId: string): string {
  return TAG_OPTIONS.find((t) => t.id === tagId)?.label ?? tagId;
}

export function getOccasionLabel(occasionId: string): string {
  return OCCASION_OPTIONS.find((o) => o.id === occasionId)?.label ?? occasionId;
}
