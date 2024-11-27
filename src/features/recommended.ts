import {
  type FeatureConfig,
  type FeatureConfigRO,
  c,
  getDefaultFeatureConfig,
} from ".";
import { isSameType } from "../utils/merge";
import type { Obj } from "../utils/obj";

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
  removePlaceholderOnEmptyLine: t({}),
  addIndentationLinesToIndentedItems: t({}),
  showPropertiesInSingleLine: t({}),
  fixFavicon: t({}),
  removeNotionAI: c({}),
  addKeymapsToAlignImage: c({}),
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
