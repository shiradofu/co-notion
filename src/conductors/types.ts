import type { FeatureInstances } from "../features";

export interface Conductor {
  conduct(features: FeatureInstances): void;
  clear(): void;
}
