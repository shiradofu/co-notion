import type { FeatureInstances } from "../features";

export interface RunBeforeConducted {
  beforeConducted(): void | Promise<void>;
}
const uniqueKey: keyof RunBeforeConducted = "beforeConducted";

export async function beforeConduct(enabledFeatures: FeatureInstances) {
  const targetFeatures = enabledFeatures.filter((f) => uniqueKey in f);
  for (const feature of targetFeatures) {
    await feature.beforeConducted();
  }
}
