import {
  type Config,
  configNames,
  defaultConfig,
  getConfigInStorage,
} from "../config";
import { mustGetOverlayContainer } from "../features/crawler";
import { setDefaultTeamspaceToSearchFilter } from "../features/defaultTeamspaceOnSearchOpen";

let config: Config = defaultConfig;

function shouldObserveOverlayContainer() {
  return config.defaultTeamspaceOnSearchOpen;
}

(async () => {
  config = await chrome.storage.sync.get<Config>(configNames);

  let prevOverlayCount = 1;
  const overlayObserver = new MutationObserver(([record]) => {
    const overlayContainer = record.target as Element;
    const count = overlayContainer.childElementCount;
    const overlayCountDiff = count - prevOverlayCount;
    prevOverlayCount = count;
    config.defaultTeamspaceOnSearchOpen &&
      overlayCountDiff > 0 &&
      setDefaultTeamspaceToSearchFilter(overlayContainer);
  });

  async function applyConfig() {
    if (shouldObserveOverlayContainer()) {
      const overlayContainer = await mustGetOverlayContainer();
      overlayObserver.observe(overlayContainer, { childList: true });
    } else {
      overlayObserver.disconnect();
    }
  }
  applyConfig();

  chrome.storage.onChanged.addListener(async (_changes, area) => {
    if (area !== "sync") return;
    config = await getConfigInStorage();
    applyConfig();
  });
})();
