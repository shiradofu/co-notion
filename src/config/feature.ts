import type { Features } from "../features";
import type { Assert, Equals } from "../utils/types";

function c<T extends Record<string | number, unknown>>(config: T) {
  return { isEnabled: false, ...config };
}

export const getDefaultFeatureConfig = () => ({
  setDefaultTeamspaceOnSearchOpen: c({
    isEnabledOnCmdOrCtrlP: false,
    isEnabledOnCmdOrCtrlK: false,
    isEnabledOnClick: false,
  }),
});

export type FeatureConfig = ReturnType<typeof getDefaultFeatureConfig>;

// type checking to prevent unused config remaining
type _ = Assert<Equals<keyof FeatureConfig, keyof Features>>;
