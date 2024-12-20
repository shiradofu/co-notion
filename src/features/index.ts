import type { SpeculativeDeployer } from "../deployers/SpeculativeDeployer";
import { AddKeymapToInsertProfilePageLink } from "./AddKeymapToInsertProfilePageLink";
import { AddKeymapsToAlignImage } from "./AddKeymapsToAlignImage";
import { AddKeymapsToCreateNewItemInDB } from "./AddKeymapsToGoUp";
import { CloseInputableDialogOnSingleEsc } from "./CloseInputableDialogOnSingleEsc";
import { FixFavicon } from "./FixFavicon";
import { PreventSearchModalFromRestoringPrevCond } from "./PreventSearchModalFromRestoringPrevCond";
import { RemoveNotionAI } from "./RemoveNotionAI";
import { SetDefaultTeamspaceOnSearchOpen } from "./SetDefaultTeamspaceOnSearchOpen";
import { ShowInlinePageLinkAsIcon } from "./ShowInlinePageLinkAsIcon";
import { StaticStyle as S } from "./StaticStyle";
import type { FeatureConfigRO } from "./config";

// for classes extends S(taticStyle), see dist/content.css
export const FeatureClasses = {
  // search
  setDefaultTeamspaceOnSearchOpen: SetDefaultTeamspaceOnSearchOpen,
  preventSearchModalFromRestoringPrevCond:
    PreventSearchModalFromRestoringPrevCond,
  // profile image icon
  showInlinePageLinkAsIcon: ShowInlinePageLinkAsIcon,
  addKeymapToInsertProfilePageLink: AddKeymapToInsertProfilePageLink,
  // database style
  alwaysShowsDatabaseMenubar: class AlwaysShowsDatabaseMenubar extends S {},
  addPinnedIndicatorToGallery: class AddPinnedIndicatorToGallery extends S {},
  makeGalleryPreivewFontSizeAllTheSame: class MakeGalleryPreivewFontSizeAllTheSame extends S {},
  placeGalleryPreviewAtTheBottom: class PlaceGalleryPreviewAtTheBottom extends S {},
  restrictGalleryTitleLength: class RestrictGalleryTitleLength extends S {},
  removeHoverMenuFromGalleryView: class RemoveHoverMenuFromGalleryView extends S {},
  removeHoverMenuFromBoardView: class RemoveHoverMenuFromBoardView extends S {},
  // editor style
  shrinkCoverImageArea: class ShrinkCoverImageArea extends S {},
  removePlaceholderOnEmptyLine: class RemovePlaceholderOnEmptyLine extends S {},
  addIndentationLinesToIndentedItems: class AddIndentationLinesToIndentedItems extends S {},
  showPropertiesInSingleLine: class ShowPropertiesInSingleLine extends S {},
  alwaysShowSyncedBlockBorder: class AlwaysShowSyncedBlockBorder extends S {},
  // misc
  fixFavicon: FixFavicon,
  removeNotionAI: RemoveNotionAI,
  // keyboard shortcuts
  addKeymapsToAlignImage: AddKeymapsToAlignImage,
  addKeymapsToCreateNewItemInDB: AddKeymapsToCreateNewItemInDB,
  closeInputableDialogOnSingleEsc: CloseInputableDialogOnSingleEsc,
} as const;

export type FeatureClassMap = typeof FeatureClasses;

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
