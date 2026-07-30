export interface CuisineOption {
  id: string;
  label: string;
  flag: string;
}

export const CUISINE_OPTIONS: CuisineOption[] = [
  { id: "iran", label: "Persian", flag: "🟩🦁🟥" },
  { id: "japan", label: "Japanese", flag: "🇯🇵" },
  { id: "canada", label: "Canadian", flag: "🇨🇦" },
  { id: "italy", label: "Italian", flag: "🇮🇹" },
  { id: "china", label: "Chinese", flag: "🇨🇳" },
  { id: "korea", label: "Korean", flag: "🇰🇷" },
  { id: "vietnam", label: "Vietnamese", flag: "🇻🇳" },
  { id: "us", label: "American", flag: "🇺🇸" },
  { id: "france", label: "French", flag: "🇫🇷" },
  { id: "thailand", label: "Thai", flag: "🇹🇭" },
  { id: "india", label: "Indian", flag: "🇮🇳" },
  { id: "lebanon", label: "Lebanese", flag: "🇱🇧" },
  { id: "greece", label: "Greek", flag: "🇬🇷" },
  { id: "germany", label: "German", flag: "🇩🇪" },
  { id: "mexico", label: "Mexican", flag: "🇲🇽" },
  { id: "other", label: "Other", flag: "🌍" },
];

export function getCuisineOption(
  cuisineId: string | undefined,
): CuisineOption | undefined {
  return CUISINE_OPTIONS.find((c) => c.id === cuisineId);
}
