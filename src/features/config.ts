import type { FeatureClassMap } from ".";
import { isSameType } from "../utils/merge";
import type { Obj } from "../utils/obj";
import type { DeepReadonly } from "../utils/types";

export function c<T extends Record<string | number, unknown>>(config: T) {
  return { isEnabled: false, ...config };
}

export const getDefaultFeatureConfig = () =>
  ({
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
    addPinnedIndicatorToGallery: c({
      hideCheckbox: false,
    }),
    makeGalleryPreivewFontSizeAllTheSame: c({}),
    placeGalleryPreviewAtTheBottom: c({}),
    restrictGalleryTitleLength: c({}),
    removeHoverMenuFromGalleryView: c({}),
    removeHoverMenuFromBoardView: c({}),
    shrinkCoverImageArea: c({}),
    removePlaceholderOnEmptyLine: c({}),
    addIndentationLinesToIndentedItems: c({}),
    showPropertiesInSingleLine: c({}),
    alwaysShowSyncedBlockBorder: c({
      makeBorderMonochrome: false,
    }),
    fixFavicon: c({}),
    removeNotionAI: c({}),
    addKeymapsToCreateNewItemInDB: c({}),
    addKeymapsToAlignImage: c({}),
    closeInputableDialogOnSingleEsc: c({}),
  }) satisfies { [K in keyof FeatureClassMap]: unknown };

export type FeatureConfig = ReturnType<typeof getDefaultFeatureConfig>;
export type FeatureConfigRO = DeepReadonly<FeatureConfig>;

function t<T extends Record<string | number, unknown>>(config: T) {
  return { isEnabled: true, ...config };
}

const d = getDefaultFeatureConfig();

const recommendedConfig: FeatureConfigRO = {
  setDefaultTeamspaceOnSearchOpen: t({
    isEnabledOnCmdOrCtrlP: false,
    isEnabledOnCmdOrCtrlK: true,
    isEnabledOnClick: false,
    useInPageFilterIfImGuest: true,
  }),
  preventSearchModalFromRestoringPrevCond: t({}),
  showInlinePageLinkAsIcon: t({
    iconSourceUrls: "",
  }),
  addKeymapToInsertProfilePageLink: t({
    profilePageTitle: "",
    keymap: d.addKeymapToInsertProfilePageLink.keymap,
  }),
  alwaysShowsDatabaseMenubar: t({}),
  addPinnedIndicatorToGallery: t({
    hideCheckbox: true,
  }),
  makeGalleryPreivewFontSizeAllTheSame: t({}),
  placeGalleryPreviewAtTheBottom: t({}),
  restrictGalleryTitleLength: t({}),
  removeHoverMenuFromGalleryView: t({}),
  removeHoverMenuFromBoardView: t({}),
  shrinkCoverImageArea: t({}),
  removePlaceholderOnEmptyLine: t({}),
  addIndentationLinesToIndentedItems: t({}),
  showPropertiesInSingleLine: t({}),
  alwaysShowSyncedBlockBorder: t({
    makeBorderMonochrome: false,
  }),
  fixFavicon: t({}),
  removeNotionAI: c({}),
  addKeymapsToAlignImage: c({}),
  addKeymapsToCreateNewItemInDB: c({}),
  closeInputableDialogOnSingleEsc: c({}),
};

function mergeRecommended(base: Obj, recommended: Obj) {
  for (const k of Object.keys(recommended)) {
    if (
      !(k in base) ||
      base[k] === null ||
      base[k] === undefined ||
      !isSameType(base[k], recommended[k])
    ) {
      continue;
    }

    if (typeof base[k] === "boolean" && !base[k] && recommended[k]) {
      base[k] = recommended[k];
      continue;
    }

    if (typeof base[k] !== "object") {
      continue;
    }

    mergeRecommended(base[k] as Obj, recommended[k] as Obj);
  }
}

export function applyRecommended(config: FeatureConfig) {
  mergeRecommended(config, recommendedConfig);
}
