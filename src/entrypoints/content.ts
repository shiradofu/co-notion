import {
  type Config,
  configNames,
  defaultConfig,
  getConfigInStorage,
} from "../config";
import { AppCrawler } from "../features/crawler/AppCrawler";
import { OverlayContainerCrawler } from "../features/crawler/OverlayContainerCrawler";
import { setDefaultTeamspaceToSearchFilter } from "../features/defaultTeamspaceOnSearchOpen";

const app = new AppCrawler();
let config: Config = defaultConfig;

function shouldObserveOverlayContainer() {
  return config.defaultTeamspaceOnSearchOpen;
}

(async () => {
  config = await chrome.storage.sync.get<Config>(configNames);

  let prevOverlayCount = 1;
  const overlayObserver = new MutationObserver(([record]) => {
    const overlayContainer = new OverlayContainerCrawler(
      record.target as Element,
    );
    const count = overlayContainer.getChildrenCount();
    const overlayCountDiff = count - prevOverlayCount;
    prevOverlayCount = count;
    config.defaultTeamspaceOnSearchOpen &&
      overlayCountDiff > 0 &&
      setDefaultTeamspaceToSearchFilter(app, overlayContainer);
  });

  async function applyConfig() {
    shouldObserveOverlayContainer()
      ? overlayObserver.observe(
          await app.getOverlayContainer("must", { wait: "long" }),
          { childList: true },
        )
      : overlayObserver.disconnect();
  }
  applyConfig();

  chrome.storage.onChanged.addListener(async (_changes, area) => {
    if (area !== "sync") return;
    config = await getConfigInStorage();
    applyConfig();
  });
})();
