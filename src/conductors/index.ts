import type { FeatureInstances } from "../features";
import { ClickmapManager } from "./ClickmapManager";
import { KeymapManager } from "./KeymapManager";
import { OverlayObserver } from "./OverlayObserver";

const conductors = [
  new OverlayObserver(),
  new KeymapManager(),
  new ClickmapManager(),
] as const;

export function conductFeatures(features: FeatureInstances) {
  for (const conductor of conductors) {
    conductor.clear();
    conductor.conduct(features);
  }
}
