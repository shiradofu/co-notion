import type { FeatureInstanceArrRO } from "../features";
import { el } from "../ui/el";
import type { Arrayable, Promisable } from "../utils/types";
import type { Deployer } from "./types";

type FeatureClassName = string;

export interface WithStyle {
  css: Promisable<Arrayable<string>>;
}
const uniqueKey: keyof WithStyle = "css";

export class StyleManager implements Deployer {
  private styleEls: Record<FeatureClassName, HTMLStyleElement> = {};

  async deploy(deployableFeatures: FeatureInstanceArrRO) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);

    for (const f of targetFeatures) {
      const styleEl = el("style", { children: [await f.css] });

      const featureClass = f.constructor.name;
      this.styleEls[featureClass]
        ? this.styleEls[featureClass].replaceWith(styleEl)
        : document.head.append(styleEl);

      this.styleEls[featureClass] = styleEl;
    }
  }

  cleanup(newEnabledFeatures: FeatureInstanceArrRO) {
    const stillEnabled = new Set(
      newEnabledFeatures
        .map((f) => f.constructor.name)
        .filter((n) => this.styleEls[n]),
    );

    const entries = Object.entries(this.styleEls);
    for (const [featureClass, el] of entries) {
      if (stillEnabled.has(featureClass)) continue;
      el.remove();
      delete this.styleEls[featureClass];
    }
  }
}
