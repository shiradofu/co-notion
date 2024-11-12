import type { FeatureInstanceArr } from "../features";

export interface RunBeforeConducted {
  beforeConducted(): void | Promise<void>;
}
const uniqueKey: keyof RunBeforeConducted = "beforeConducted";

export async function beforeConduct(deployableFeatures: FeatureInstanceArr) {
  const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
  for (const feature of targetFeatures) {
    await feature.beforeConducted();
  }
}
