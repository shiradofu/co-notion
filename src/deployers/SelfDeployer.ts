import type { FeatureInstanceArrRO } from "../features";
import type { Nullable, Promisable } from "../utils/types";
import type { Deployer } from "./types";

type CleanupFn = () => void;
type FeatureClassName = string;

export interface SelfDeployed {
  deploySelf(wasCleanedup: boolean): Promisable<Nullable<CleanupFn>>;
}
const uniqueKey: keyof SelfDeployed = "deploySelf";

export class SelfDeployer implements Deployer {
  private cleanupFns: Record<FeatureClassName, CleanupFn> = {};

  async deploy(deployableFeatures: FeatureInstanceArrRO) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);

    for (const f of targetFeatures) {
      const featureClass = f.constructor.name;
      const wasCleanedup = !this.cleanupFns[featureClass];
      const fn = f.deploySelf(wasCleanedup);
      if (fn) this.cleanupFns[f.constructor.name] = fn;
    }
  }

  cleanup(newEnabledFeatures: FeatureInstanceArrRO) {
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
