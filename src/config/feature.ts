import type { Features } from "../features";
import type { Assert, Equals } from "../utils/types";

function c<T extends Record<string | number, unknown>>(config: T) {
  return { isEnabled: false, ...config };
}

export const defaultFeatureConfig = {
  setDefaultTeamspaceOnSearchOpen: c({}),
};

export type FeatureConfig = typeof defaultFeatureConfig;

// type checking to prevent unused config remaining
type _ = Assert<Equals<keyof FeatureConfig, keyof Features>>;
