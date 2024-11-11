import type { FeatureInstances } from "../features";
import { el } from "../ui/el";
import type { Arrayable, Promisable } from "../utils/types";
import type { Conductor } from "./types";

export interface withStyle {
  css: Promisable<Arrayable<string>>;
}
const uniqueKey: keyof withStyle = "css";

export class StyleAppender implements Conductor {
  private styleEls: HTMLStyleElement[] = [];

  async conduct(enabledFeatures: FeatureInstances) {
    const targetFeatures = enabledFeatures.filter((f) => uniqueKey in f);
    for (const f of targetFeatures) {
      const styleEl = el("style", { children: [await f.css] });
      this.styleEls.push(styleEl);
      document.head.append(styleEl);
    }
  }

  clear() {
    for (const s of this.styleEls) s.remove();
    this.styleEls = [];
  }
}
