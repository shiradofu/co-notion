import type { WithStaticStyle } from "../deployers/StaticStyleManager";

class StaticStyle implements WithStaticStyle {
  readonly hasStaticStyle = true;
}

export const S = StaticStyle;
