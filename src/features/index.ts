import type { SpeculativeDeployer } from "../deployers/SpeculativeDeployer";
import type { Assert, DeepReadonly, Equals } from "../utils/types";
import { AddKeymapToInsertProfilePageLink } from "./AddKeymapToInsertProfilePageLink";
import { CloseInputableDialogOnSingleEsc } from "./CloseInputableDialogOnSingleEsc";
import { FixFavicon } from "./FixFavicon";
import { PreventSearchModalFromRestoringPrevCond } from "./PreventSearchModalFromRestoringPrevCond";
import { RemovePlaceholderOnEmptyLine } from "./RemovePlaceholderOnEmptyLine";
import { SetDefaultTeamspaceOnSearchOpen } from "./SetDefaultTeamspaceOnSearchOpen";
import { ShowInlinePageLinkAsIcon } from "./ShowInlinePageLinkAsIcon";

export const FeatureClasses = {
  setDefaultTeamspaceOnSearchOpen: SetDefaultTeamspaceOnSearchOpen,
  preventSearchModalFromRestoringPrevCond:
    PreventSearchModalFromRestoringPrevCond,
  showInlinePageLinkAsIcon: ShowInlinePageLinkAsIcon,
  addKeymapToInsertProfilePageLink: AddKeymapToInsertProfilePageLink,
  removePlaceholderOnEmptyLine: RemovePlaceholderOnEmptyLine,
  fixFavicon: FixFavicon,
  closeInputableDialogOnSingleEsc: CloseInputableDialogOnSingleEsc,
} as const;

function c<T extends Record<string | number, unknown>>(config: T) {
  return { isEnabled: false, ...config };
}

export const getDefaultFeatureConfig = () => ({
  setDefaultTeamspaceOnSearchOpen: c({
    isEnabledOnCmdOrCtrlP: false,
    isEnabledOnCmdOrCtrlK: false,
    isEnabledOnClick: false,
    useInPageFilterIfImGuest: false,
  }),
  preventSearchModalFromRestoringPrevCond: c({}),
  showInlinePageLinkAsIcon: c({
    iconSourceUrls: "",
  }),
  addKeymapToInsertProfilePageLink: c({
    profilePageTitle: "",
    keymap: "Cmd/Ctrl+I",
  }),
  removePlaceholderOnEmptyLine: c({}),
  fixFavicon: c({}),
  closeInputableDialogOnSingleEsc: c({}),
});

export type FeatureConfig = ReturnType<typeof getDefaultFeatureConfig>;
export type FeatureConfigRO = DeepReadonly<FeatureConfig>;

// type checking to prevent unused config remaining
type _ = Assert<Equals<keyof FeatureConfig, keyof typeof FeatureClasses>>;

type FeatureInstanceArr = InstanceType<
  (typeof FeatureClasses)[keyof typeof FeatureClasses]
>[];
export type FeatureInstanceArrRO = readonly InstanceType<
  (typeof FeatureClasses)[keyof typeof FeatureClasses]
>[];

export function buildFeatures(
  featureConfig: FeatureConfigRO,
  speculativeDeployer: SpeculativeDeployer,
) {
  const deployable: FeatureInstanceArr = [];

  for (const name of Object.keys(FeatureClasses).filter(
    (k): k is keyof typeof FeatureClasses => true,
  )) {
    const { isEnabled } = featureConfig[name];
    const speculative = speculativeDeployer.get(name);

    if (isEnabled && !speculative) {
      // biome-ignore lint: suspicious/noExplicitAny
      const instance = new FeatureClasses[name](featureConfig[name] as any);
      deployable.push(instance);
    }

    if (!isEnabled && speculative) {
      speculativeDeployer.delete(name);
    }
  }

  return deployable as FeatureInstanceArrRO;
}
