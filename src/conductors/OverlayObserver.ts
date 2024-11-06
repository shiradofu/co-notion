import { OverlayContainerCrawler } from "../crawlers/OverlayContainerCrawler";
import type { FeatureInstances } from "../features/";
import { BaseObserver } from "./BaseObserver";
import type { Conductor } from "./types";

export interface TriggeredByOverlayMutation {
  onMutateOverlay: (
    overlayContainer: OverlayContainerCrawler,
    overlayCountDiff: number,
  ) => void;
}
const uniqueKey: keyof TriggeredByOverlayMutation = "onMutateOverlay";

export class OverlayObserver extends BaseObserver implements Conductor {
  private prevOverlayCount = 1;
  private overlayContainer?: OverlayContainerCrawler;

  async conduct(enabledFeatures: FeatureInstances) {
    const targetFeatures = enabledFeatures.filter((f) => uniqueKey in f);
    if (targetFeatures.length === 0) return;

    this.observer = new MutationObserver(([record]) => {
      this.overlayContainer =
        this.overlayContainer ??
        new OverlayContainerCrawler(record.target as Element);
      const count = this.overlayContainer.getChildrenCount();
      const overlayCountDiff = count - this.prevOverlayCount;
      this.prevOverlayCount = count;

      for (const f of targetFeatures) {
        f.onMutateOverlay(this.overlayContainer, overlayCountDiff);
      }
    });

    this.observer.observe(
      await this.app.getOverlayContainer("must", { wait: "long" }),
      { childList: true },
    );
  }
}
