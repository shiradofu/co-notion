export const enUS = {
  configUI: {
    submit: "Save changes",
    setDefaultTeamspaceOnSearchOpen: {
      isEnabled: "Set the default teamspace when search modal is opened",
      isEnabledOnCmdOrCtrlP: "by Cmd/Ctrl+P",
      isEnabledOnCmdOrCtrlK: "by Cmd/Ctrl+K",
      isEnabledOnClick: "by clicking 'Search' on the sidebar",
    },
    closeInputableDialogOnSingleEsc: {
      isEnabled: "Close inputable dialog on single Esc",
    },
    preventSearchModalFromRestoringPrevCond: {
      isEnabled: "Prevent search modal from restoring prev conditions",
    },
    addKeymapToInsertProfilePageLink: {
      isEnabled: "Add keymap to insert profile page link",
      profilePageTitle: "profile page title",
      keymap: "keymap",
    },
    showInlinePageLinkAsIcon: {
      isEnabled: "Show in-line page links as icons",
      iconSourceUrls: "URLs of pages/DBs containing icon pages",
      reload: (target: string) => `load "${target}"`,
    },
  },
  feature: {
    showInlinePageLinkAsIcon: {
      crawlSuccess: (n: number) => `${n} ${n === 1 ? "page" : "pages"} loaded!`,
      crawlFailure: "No pages found",
    },
  },
};
