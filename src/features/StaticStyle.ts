import type { WithStaticStyle } from "../deployers/StaticStyleManager";
import type { Obj } from "../utils/obj";

export class StaticStyle implements WithStaticStyle {
  readonly staticStyleOpts: string[] = [];

  constructor(config: Obj) {
    for (const [k, v] of Object.entries(config)) {
      if (typeof v !== "boolean" || !v || k === "isEnabled") continue;
      this.staticStyleOpts.push(k);
    }
  }
}
