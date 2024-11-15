export const jaJP = {
  configUI: {
    submit: "設定を保存",
    setDefaultTeamspaceOnSearchOpen: {
      isEnabled: "検索時に自動で現在のチームスペースを指定",
      isEnabledOnCmdOrCtrlP: "Cmd/Ctrl+P で検索を開いたとき",
      isEnabledOnCmdOrCtrlK: "Cmd/Ctrl+K で検索を開いたとき",
      isEnabledOnClick: "サイドバーの「検索」をクリックして開いたとき",
      useInPageFilterIfImGuest:
        "自分がゲストのときは「ページ内」フィルタを使う",
    },
    preventSearchModalFromRestoringPrevCond: {
      isEnabled: "前回の検索条件を復元しない",
    },
    showInlinePageLinkAsIcon: {
      isEnabled: "文中のページリンクをアイコンとして表示",
      iconSourceUrls: "アイコン表示したいページを含んだページ・DBのURL",
      reload: (target: string) => `「${target}」を読込`,
    },
    addKeymapToInsertProfilePageLink: {
      isEnabled: "プロフィールページへのリンクをショートカットで挿入",
      profilePageTitle: "プロフィールページ名",
      keymap: "キーボードショートカット",
    },
    removePlaceholderOnEmptyLine: {
      isEnabled: "空行に表示されるプレースホルダを非表示",
    },
    showPropertiesInSingleLine: {
      isEnabled: "ページのプロパティを1行で表示",
    },
    fixFavicon: {
      isEnabled: "タブに表示するアイコンを常に同じにする",
    },
    closeInputableDialogOnSingleEsc: {
      isEnabled: "文字入力可能なウィンドウを Esc 一回で閉じる",
    },
  },
  feature: {
    showInlinePageLinkAsIcon: {
      crawlSuccess: (n: number) => `${n}件読み込みました！`,
      crawlFailure: "対象が見つかりませんでした",
    },
  },
  notionTerms: {
    Teamspace: "チームスペース",
    searchModal: {
      filterBar: {
        In: "ページ内",
      },
    },
  },
} as const;
