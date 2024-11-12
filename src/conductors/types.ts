import type { FeatureInstanceArr } from "../features";

export interface Conductor {
  conduct(deployableFeatures: FeatureInstanceArr): void;
  clear(newDeployableFeatures: FeatureInstanceArr): void;
}
