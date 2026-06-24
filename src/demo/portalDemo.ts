import demoCsvRaw from "../../0055178-260519110011954.csv?raw";

export const DEMO_CSV_FILE_NAME = "0055178-260519110011954.csv";
export const DEMO_PLAYER_NAME = "Demo GBIF";
export const PORTAL_DEMO_DURATION_MINUTES = 5;

let prepared = false;

export function isPortalDemoMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

export function getDemoCsvText() {
  return demoCsvRaw;
}

export function getDemoCsvFile() {
  return new File([demoCsvRaw], DEMO_CSV_FILE_NAME, { type: "text/csv;charset=utf-8" });
}

export function preparePortalDemoSession() {
  if (prepared || !isPortalDemoMode()) return;
  prepared = true;

  try {
    localStorage.setItem("dwc-data-quest-language", "en");
    localStorage.setItem("dwc-dark-mode", "true");
    localStorage.setItem("dwc-import-tutorial-seen", "1");
    localStorage.setItem("dwc-mapper-tutorial-seen", "1");
    localStorage.setItem("dwc-mapper-tutorial-phase2-seen", "1");
    localStorage.removeItem("dwc-data-quest-progress");
    localStorage.removeItem("dwc-data-quest-assistant-position");

    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(`dwc-mappings-${DEMO_CSV_FILE_NAME}`)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Demo mode should never prevent the app from loading.
  }
}
