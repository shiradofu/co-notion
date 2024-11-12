import type { FeatureInstanceArr } from "../features";
import type { Nullable, Promisable } from "../utils/types";
import type { Conductor } from "./types";

type CleanupFn = () => void;
type FeatureClassName = string;

export interface SelfConducted {
  conductSelf(wasCleanedup: boolean): Promisable<Nullable<CleanupFn>>;
}
const uniqueKey: keyof SelfConducted = "conductSelf";

export class SelfConductor implements Conductor {
  private cleanupFns: Record<FeatureClassName, CleanupFn> = {};

  async conduct(deployableFeatures: FeatureInstanceArr) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);

    for (const f of targetFeatures) {
      const featureClass = f.constructor.name;
      const wasCleanedup = !this.cleanupFns[featureClass];
      const fn = f.conductSelf(wasCleanedup);
      if (fn) this.cleanupFns[f.constructor.name] = fn;
    }
  }

  clear(newEnabledFeatures: FeatureInstanceArr) {
    const stillEnabled = new Set(
      newEnabledFeatures
        .map((f) => f.constructor.name)
        .filter((n) => this.cleanupFns[n]),
    );

    const entries = Object.entries(this.cleanupFns);
    for (const [featureClass, cleanupFn] of entries) {
      if (stillEnabled.has(featureClass)) continue;
      cleanupFn();
      delete this.cleanupFns[featureClass];
    }
  }
}
