import { type FeatureConfig, defaultFeatureConfig } from "../config/feature";
import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlayContainerCrawler } from "../crawlers/OverlayContainerCrawler";
import { SetDefaultTeamspaceOnSearchOpen } from "../features/SetDefaultTeamspaceOnSearchOpen";
import { getFromSyncStorage } from "../utils/storage";

const app = new AppCrawler();
let featureConfig: FeatureConfig = defaultFeatureConfig;

function shouldObserveOverlayContainer() {
  return featureConfig.defaultTeamspaceOnSearchOpen;
}

(async () => {
  featureConfig = await getFromSyncStorage("featureConfig");

  let prevOverlayCount = 1;
  const overlayObserver = new MutationObserver(([record]) => {
    const overlayContainer = new OverlayContainerCrawler(
      record.target as Element,
    );
    const count = overlayContainer.getChildrenCount();
    const overlayCountDiff = count - prevOverlayCount;
    prevOverlayCount = count;
    featureConfig.defaultTeamspaceOnSearchOpen &&
      new SetDefaultTeamspaceOnSearchOpen().run(
        app,
        overlayContainer,
        overlayCountDiff,
      );
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
    featureConfig = await getFromSyncStorage("featureConfig");
    applyConfig();
  });
})();
