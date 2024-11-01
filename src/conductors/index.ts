import type { FeatureInstances } from "../features";
import { OverlayObserver } from "./OverlayObserver";

const conductors = [new OverlayObserver()] as const;

export function conductFeatures(features: FeatureInstances) {
  for (const conductor of conductors) {
    conductor.clear();
    conductor.conduct(features);
  }
}
