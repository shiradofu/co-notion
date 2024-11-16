import type { WithStaticStyle } from "../deployers/StaticStyleManager";

export class StaticStyle implements WithStaticStyle {
  readonly hasStaticStyle = true;
}
