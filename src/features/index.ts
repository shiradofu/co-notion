import type { SpeculativeDeployer } from "../deployers/SpeculativeDeployer";
import type { Assert, DeepReadonly, Equals } from "../utils/types";
import { AddKeymapToInsertProfilePageLink } from "./AddKeymapToInsertProfilePageLink";
import { AddKeymapsToActionsMenu } from "./AddKeymapsToActionsMenu";
import { AddKeymapsToAlignSelectedImage } from "./AddKeymapsToAlignSelectedImage";
import { CloseInputableDialogOnSingleEsc } from "./CloseInputableDialogOnSingleEsc";
import { FixFavicon } from "./FixFavicon";
import { PreventSearchModalFromRestoringPrevCond } from "./PreventSearchModalFromRestoringPrevCond";
import { RemoveNotionAI } from "./RemoveNotionAI";
import { SetDefaultTeamspaceOnSearchOpen } from "./SetDefaultTeamspaceOnSearchOpen";
import { ShowInlinePageLinkAsIcon } from "./ShowInlinePageLinkAsIcon";
import { StaticStyle as S } from "./StaticStyle";

export const FeatureClasses = {
  setDefaultTeamspaceOnSearchOpen: SetDefaultTeamspaceOnSearchOpen,
  preventSearchModalFromRestoringPrevCond:
    PreventSearchModalFromRestoringPrevCond,
  showInlinePageLinkAsIcon: ShowInlinePageLinkAsIcon,
  addKeymapToInsertProfilePageLink: AddKeymapToInsertProfilePageLink,
  alwaysShowsDatabaseMenubar: class AlwaysShowsDatabaseMenubar extends S {},
  makeGalleryPreivewFontSizeAllTheSame: class MakeGalleryPreivewFontSizeAllTheSame extends S {},
  placeGalleryPreviewAtTheBottom: class PlaceGalleryPreviewAtTheBottom extends S {},
  restrictGalleryTitleLength: class RestrictGalleryTitleLength extends S {},
  removeHoverMenuFromGalleryView: class RemoveHoverMenuFromGalleryView extends S {},
  removeHoverMenuFromBoardView: class RemoveHoverMenuFromBoardView extends S {},
  addKeymapsToActionsMenu: AddKeymapsToActionsMenu,
  addKeymapsToAlignSelectedImage: AddKeymapsToAlignSelectedImage,
  removePlaceholderOnEmptyLine: class RemovePlaceholderOnEmptyLine extends S {},
  addIndentationLinesToIndentedItems: class AddIndentationLinesToIndentedItems extends S {},
  showPropertiesInSingleLine: class ShowPropertiesInSingleLine extends S {},
  removeSidebarClosingFeatureFromBorder: class RemoveSidebarClosingFeatureFromBorder extends S {},
  fixFavicon: FixFavicon,
  closeInputableDialogOnSingleEsc: CloseInputableDialogOnSingleEsc,
  removeNotionAI: RemoveNotionAI,
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
  alwaysShowsDatabaseMenubar: c({}),
  makeGalleryPreivewFontSizeAllTheSame: c({}),
  placeGalleryPreviewAtTheBottom: c({}),
  restrictGalleryTitleLength: c({}),
  removeHoverMenuFromGalleryView: c({}),
  removeHoverMenuFromBoardView: c({}),
  addKeymapsToActionsMenu: c({}),
  addKeymapsToAlignSelectedImage: c({}),
  removePlaceholderOnEmptyLine: c({}),
  addIndentationLinesToIndentedItems: c({}),
  showPropertiesInSingleLine: c({}),
  removeSidebarClosingFeatureFromBorder: c({}),
  fixFavicon: c({}),
  closeInputableDialogOnSingleEsc: c({}),
  removeNotionAI: c({}),
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
