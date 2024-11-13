import type { FeatureInstanceArr } from "../features";

export interface Deployer {
  deploy(deployableFeatures: FeatureInstanceArr): void;
  cleanup(newDeployableFeatures: FeatureInstanceArr): void;
}
