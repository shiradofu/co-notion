import type { FeatureInstanceArr } from "../features";

export interface RunBeforeDeployed {
  beforeDeployed(): void | Promise<void>;
}
const uniqueKey: keyof RunBeforeDeployed = "beforeDeployed";

export async function beforeDeploy(deployableFeatures: FeatureInstanceArr) {
  const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
  for (const feature of targetFeatures) {
    await feature.beforeDeployed();
  }
}
