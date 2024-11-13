import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import type { FeatureInstanceArr } from "../features/";
import { BaseObserver } from "./BaseObserver";
import type { Deployer } from "./types";

export interface TriggeredByOverlayMutation {
  onMutateOverlay: (
    overlays: OverlaysCrawler,
    overlaysCountDiff: number,
  ) => void;
}
const uniqueKey: keyof TriggeredByOverlayMutation = "onMutateOverlay";

export class OverlayObserver extends BaseObserver implements Deployer {
  private prevOverlaysCount = 0;
  private overlays?: OverlaysCrawler;

  async deploy(deployableFeatures: FeatureInstanceArr) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
    if (targetFeatures.length === 0) return;

    this.observer = new MutationObserver(([record]) => {
      this.overlays =
        this.overlays ?? new OverlaysCrawler(record.target as Element);
      const count = this.overlays.count;
      const overlaysCountDiff = count - this.prevOverlaysCount;
      this.prevOverlaysCount = count;

      for (const f of targetFeatures) {
        f.onMutateOverlay(this.overlays, overlaysCountDiff);
      }
    });

    this.observer.observe(
      await this.app.getOverlayContainer("must", { wait: "long" }),
      { childList: true },
    );
  }
}
