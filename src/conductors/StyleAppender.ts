import type { FeatureInstanceArr } from "../features";
import { el } from "../ui/el";
import type { Arrayable, Promisable } from "../utils/types";
import type { Conductor } from "./types";

type FeatureClassName = string;

export interface withStyle {
  css: Promisable<Arrayable<string>>;
}
const uniqueKey: keyof withStyle = "css";

export class StyleAppender implements Conductor {
  private styleEls: Record<FeatureClassName, HTMLStyleElement> = {};

  async conduct(deployableFeatures: FeatureInstanceArr) {
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

  clear(newEnabledFeatures: FeatureInstanceArr) {
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
