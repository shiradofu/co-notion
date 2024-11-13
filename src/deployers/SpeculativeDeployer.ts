import type { FeatureClasses } from "../features";
import type { Nullable } from "../utils/types";

type FeatureName = keyof typeof FeatureClasses;
type CancelFn = () => void;

export interface Speculative {
  speculate(): Nullable<CancelFn>;
}

interface SpeculativeClass {
  speculativeNew(): Speculative;
}
const uniqueKeyForClass: keyof SpeculativeClass = "speculativeNew";

export class SpeculativeDeployer {
  private features: Partial<Record<FeatureName, Speculative>> = {};
  private cancelFns: Partial<Record<FeatureName, CancelFn>> = {};

  static deploy(featureClasses: typeof FeatureClasses) {
    const deployer = new SpeculativeDeployer();
    deployer.run(featureClasses);
    return deployer;
  }

  get(name: keyof typeof FeatureClasses): Speculative | undefined {
    return this.features[name];
  }

  delete(name: keyof typeof FeatureClasses) {
    const cancelFn = this.cancelFns[name];
    if (cancelFn) cancelFn();

    delete this.features[name];
    delete this.cancelFns[name];
  }

  private run(featureClasses: typeof FeatureClasses) {
    for (const [nameUntyped, Class] of Object.entries(featureClasses)) {
      const name = nameUntyped as keyof typeof FeatureClasses;
      if (!(uniqueKeyForClass in Class)) return;

      const feature = Class.speculativeNew();
      this.features[name] = feature;

      const cancelFn = feature.speculate();

      if (cancelFn) {
        this.cancelFns[name] = cancelFn;
      }
    }
  }
}
