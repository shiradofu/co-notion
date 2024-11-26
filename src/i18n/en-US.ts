export const enUS = {
  configUI: {
    submit: "Save changes",
    setDefaultTeamspaceOnSearchOpen: {
      isEnabled: "Set the default teamspace when search modal is opened",
      isEnabledOnCmdOrCtrlP: "by Cmd/Ctrl+P",
      isEnabledOnCmdOrCtrlK: "by Cmd/Ctrl+K",
      isEnabledOnClick: "by clicking 'Search' on the sidebar",
      useInPageFilterIfImGuest: "Use 'In' filter if I'm a guest",
    },
    preventSearchModalFromRestoringPrevCond: {
      isEnabled: "Prevent search modal from restoring prev conditions",
    },
    showInlinePageLinkAsIcon: {
      isEnabled: "Show in-line page links as icons",
      iconSourceUrls: "URLs of pages/DBs containing icon pages",
      reload: (target: string) => `load "${target}"`,
    },
    addKeymapToInsertProfilePageLink: {
      isEnabled: "Add keymap to insert profile page link",
      profilePageTitle: "profile page title",
      keymap: "keymap",
    },
    alwaysShowsDatabaseMenubar: {
      isEnabled: "Always shows database menu bars",
    },
    addPinnedIndicatorToGallery: {
      isEnabled: "Add pinned indicator to gallery view items",
      hideCheckbox: "Hide checkbox property",
    },
    makeGalleryPreivewFontSizeAllTheSame: {
      isEnabled: "Make gallery preivew font size all the same",
    },
    placeGalleryPreviewAtTheBottom: {
      isEnabled: "Place gallery preview at the bottom",
    },
    restrictGalleryTitleLength: {
      isEnabled: "Restrict gallery title length",
    },
    removeHoverMenuFromGalleryView: {
      isEnabled: "Remove buttons shown on mouse over from gallery view",
    },
    removeHoverMenuFromBoardView: {
      isEnabled: "Remove buttons shown on mouse over from board view",
    },
    removePlaceholderOnEmptyLine: {
      isEnabled: "Remove placeholder on empty line",
    },
    addIndentationLinesToIndentedItems: {
      isEnabled: "Show indentation lines",
    },
    showPropertiesInSingleLine: {
      isEnabled: "Show page properties in single line",
    },
    fixFavicon: {
      isEnabled: "Always shows the same icon on Notion tabs",
    },
    removeNotionAI: {
      isEnabled: "Hide Notion AI",
    },
    addKeymapsToAlignSelectedImage: {
      isEnabled: "Add keymaps to align selected image",
    },
    closeInputableDialogOnSingleEsc: {
      isEnabled: "Close inputable dialog on single Esc",
    },
  },
  feature: {
    showInlinePageLinkAsIcon: {
      crawlSuccess: (n: number) => `${n} ${n === 1 ? "page" : "pages"} loaded!`,
      crawlFailure: "No pages found",
    },
  },
  notionTerms: {
    Teamspace: "Teamspace",
    searchModal: {
      filterBar: {
        In: "In",
      },
    },
  },
} as const;
