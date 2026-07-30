export type ThemePreference = "auto" | "light" | "dark";

const STORAGE_KEY = "tik2map-theme";

// Fired on window whenever the resolved (auto vs. explicit) theme changes,
// so anything that needs to react - like MapView swapping its Mapbox style -
// doesn't have to duplicate the storage/matchMedia logic to figure out when.
export const THEME_CHANGE_EVENT = "tik2map-theme-change";

export function getStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "auto";
}

export function getResolvedTheme(): "light" | "dark" {
  const stored = getStoredTheme();
  if (stored !== "auto") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Reflects the preference onto <html> as data-theme so CSS can override the
// prefers-color-scheme media query when the user picked an explicit theme,
// and clears it in "auto" mode so the media query is back in charge. Safe to
// call before React mounts (see the inline script in index.html) to avoid a
// flash of the wrong theme on load.
export function applyTheme(theme: ThemePreference): void {
  if (theme === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function setStoredTheme(theme: ThemePreference): void {
  if (theme === "auto") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
  }
  applyTheme(theme);
}
