import type { FeatureConfig } from "../config/feature";
import { CloseInputableDialogOnSingleEsc } from "./CloseInputableDialogOnSingleEsc";
import { SetDefaultTeamspaceOnSearchOpen } from "./SetDefaultTeamspaceOnSearchOpen";

const FeatureClasses = {
  setDefaultTeamspaceOnSearchOpen: SetDefaultTeamspaceOnSearchOpen,
  closeInputableDialogOnSingleEsc: CloseInputableDialogOnSingleEsc,
} as const;

export type Features = {
  -readonly [key in keyof typeof FeatureClasses]?: InstanceType<
    (typeof FeatureClasses)[key]
  >;
};

export function buildFeatures(featureConfig: FeatureConfig) {
  const features: Features = {};
  Object.keys(FeatureClasses)
    .filter((v): v is keyof typeof FeatureClasses => true)
    .map((k) => {
      // TODO: new FeatureClasses[k](featureConfig[k], features)
      const instance = featureConfig[k].isEnabled
        ? // biome-ignore lint: suspicious/noExplicitAny
          new FeatureClasses[k](featureConfig[k] as any)
        : undefined;
      (features[k] as typeof instance) = instance;
    });
  return Object.values(features).filter((f) => f);
}

export type FeatureInstances = ReturnType<typeof buildFeatures>;
