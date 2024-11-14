import type { FeatureInstanceArrRO } from "../features";

export interface Deployer {
  deploy(deployableFeatures: FeatureInstanceArrRO): void;
  cleanup(newDeployableFeatures: FeatureInstanceArrRO): void;
}
