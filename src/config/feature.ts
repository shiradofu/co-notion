function c<T extends Record<string | number, unknown>>(config: T) {
  return { isEnabled: false, ...config };
}

export const defaultFeatureConfig = {
  setDefaultTeamspaceOnSearchOpen: c({}),
};

export type FeatureConfig = typeof defaultFeatureConfig;
