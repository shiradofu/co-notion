import type { SpeculativeConductor } from "../conductors/SpeculativeConductor";
import type { Assert, Equals } from "../utils/types";
import { AddKeymapToInsertProfilePageLink } from "./AddKeymapToInsertProfilePageLink";
import { CloseInputableDialogOnSingleEsc } from "./CloseInputableDialogOnSingleEsc";
import { FixFavicon } from "./FixFavicon";
import { PreventSearchModalFromRestoringPrevCond } from "./PreventSearchModalFromRestoringPrevCond";
import { SetDefaultTeamspaceOnSearchOpen } from "./SetDefaultTeamspaceOnSearchOpen";
import { ShowInlinePageLinkAsIcon } from "./ShowInlinePageLinkAsIcon";

export const FeatureClasses = {
  setDefaultTeamspaceOnSearchOpen: SetDefaultTeamspaceOnSearchOpen,
  closeInputableDialogOnSingleEsc: CloseInputableDialogOnSingleEsc,
  preventSearchModalFromRestoringPrevCond:
    PreventSearchModalFromRestoringPrevCond,
  addKeymapToInsertProfilePageLink: AddKeymapToInsertProfilePageLink,
  showInlinePageLinkAsIcon: ShowInlinePageLinkAsIcon,
  fixFavicon: FixFavicon,
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
  fixFavicon: c({}),
  closeInputableDialogOnSingleEsc: c({}),
});

export type FeatureConfig = ReturnType<typeof getDefaultFeatureConfig>;

// type checking to prevent unused config remaining
type _ = Assert<Equals<keyof FeatureConfig, keyof Features>>;

export type Features = {
  -readonly [key in keyof typeof FeatureClasses]?: InstanceType<
    (typeof FeatureClasses)[key]
  >;
};

export type FeatureInstanceArr = InstanceType<
  (typeof FeatureClasses)[keyof typeof FeatureClasses]
>[];

export function buildFeatures(
  featureConfig: FeatureConfig,
  speculativeConductor: SpeculativeConductor,
) {
  const deployable: FeatureInstanceArr = [];

  for (const name of Object.keys(FeatureClasses).filter(
    (k): k is keyof typeof FeatureClasses => true,
  )) {
    const { isEnabled } = featureConfig[name];
    const speculative = speculativeConductor.get(name);

    if (isEnabled && !speculative) {
      // biome-ignore lint: suspicious/noExplicitAny
      const instance = new FeatureClasses[name](featureConfig[name] as any);
      deployable.push(instance);
    }

    if (!isEnabled && speculative) {
      speculativeConductor.delete(name);
    }
  }

  return deployable;
}
