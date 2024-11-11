import type { FeatureInstances } from "../features";

export interface Conductor {
  conduct(enabledFeatures: FeatureInstances): void;
  clear(): void;
}
