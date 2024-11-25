import { CMD_OR_CTRL, IS_MACOS } from "../utils/os";

export const jaJP = {
  configUI: {
    submit: "設定を保存",
    setDefaultTeamspaceOnSearchOpen: {
      isEnabled: "検索時に自動で現在のチームスペースを指定",
      isEnabledOnCmdOrCtrlP: `Cmd/Ctrl+P で検索を開いたとき`,
      isEnabledOnCmdOrCtrlK: "Cmd/Ctrl+K で検索を開いたとき",
      isEnabledOnClick: "サイドバーの「検索」をクリックして開いたとき",
      useInPageFilterIfImGuest: "自分がゲストのときは「場所」フィルタを使う",
      helpModal: `
        # 検索時に自動で現在のチームスペースを指定
        ## 機能概要
        ワークスペースの検索時に、自動で現在のチームスペースをフィルタにセットします。「自分がゲストのときは『場所』フィルタを使う」をオンにしておくと、招待されたファイルでは「場所」フィルタを使用します。
        ## 機能詳細
        Notion ではワークスペース全体からファイル名および文章を検索できるウィンドウを ${CMD_OR_CTRL}+P か  ${CMD_OR_CTRL}+K、もしくは左のサイドバーの「検索」から開くことができます。
        デフォルトでは自分がアクセスできるすべてのページからの検索となりますが、ページ数が増えてくると検索結果に関係のないページが入り込み、目的のページを見つける難易度が上がります。
        こういう場合、手動でフィルタを設定することができ、↓ の右の ≡ ボタンを押すと
        ![img]setDefaultTeamspaceOnSearchOpen-filterbar-not-opened-ja.png
        このようなフィルタのリストが出てきて、結果を絞り込むことができます。
        ![img]setDefaultTeamspaceOnSearchOpen-filterbar-opened-ja.png
        自分が今開いているページと関連のあるページを検索したい場合、「チームスペース」フィルタ(自分がゲストの場合は「場所」フィルタ) を設定するとよいですが、これを毎回のように設定するとなると面倒です。
        この機能をオンにしておくと、特定の方法で検索を開いたときに自動でこれらのフィルタを設定することができます。
      `,
    },
    preventSearchModalFromRestoringPrevCond: {
      isEnabled: "前回の検索条件を復元しない",
      helpModal: ``,
    },
    showInlinePageLinkAsIcon: {
      isEnabled: "文中のページリンクをアイコンとして表示",
      iconSourceUrls: "アイコン表示したいページを含んだページ・DBのURL",
      reload: (target: string) => `「${target}」を読込`,
      helpModal: ``,
    },
    addKeymapToInsertProfilePageLink: {
      isEnabled: "プロフィールページへのリンクをショートカットで挿入",
      profilePageTitle: "プロフィールページ名",
      keymap: "キーボードショートカット",
      helpModal: ``,
    },
    alwaysShowsDatabaseMenubar: {
      isEnabled: "データベースのメニューバーを常に表示",
      helpModal: ``,
    },
    makeGalleryPreivewFontSizeAllTheSame: {
      isEnabled: "ギャラリービューのプレビューのフォントサイズを揃える",
      helpModal: ``,
    },
    placeGalleryPreviewAtTheBottom: {
      isEnabled: "ギャラリービューのプレビューを下に配置",
      helpModal: ``,
    },
    restrictGalleryTitleLength: {
      isEnabled: "ギャラリービューのタイトルの長さを制限",
      helpModal: ``,
    },
    removeHoverMenuFromGalleryView: {
      isEnabled:
        "ギャラリービューでカーソルを合わせたときに出てくるボタンを非表示",
      helpModal: ``,
    },
    removeHoverMenuFromBoardView: {
      isEnabled: "ボードビューでカーソルを合わせたときに出てくるボタンを非表示",
      helpModal: ``,
    },
    removePlaceholderOnEmptyLine: {
      isEnabled: "空行に表示されるプレースホルダを非表示",
      helpModal: ``,
    },
    addIndentationLinesToIndentedItems: {
      isEnabled: "箇条書きなどの階層がわかりやすいように線を表示",
      helpModal: ``,
    },
    removeArrowFromMentionLink: {
      isEnabled: "メンションリンクの矢印を非表示",
      helpModal: ``,
    },
    showPropertiesInSingleLine: {
      isEnabled: "ページのプロパティを1行で表示",
      helpModal: ``,
    },
    fixFavicon: {
      isEnabled: "タブに表示するアイコンを常に同じにする",
      helpModal: ``,
    },
    removeSidebarClosingFeatureFromBorder: {
      isEnabled: "サイドバーが右端クリックで閉じるのを無効化",
      helpModal: ``,
    },
    removeNotionAI: {
      isEnabled: "Notion AI を非表示",
      helpModal: ``,
    },
    addKeymapsToActionsMenu: {
      isEnabled: `アクションメニューにショートカットを追加 (${IS_MACOS ? "Cmd" : "Ctrl"}+;)`,
      helpModal: ``,
    },
    addKeymapsToAlignSelectedImage: {
      isEnabled: "選択中の画像の揃え指定にショートカットを追加",
      helpModal: ``,
    },
    closeInputableDialogOnSingleEsc: {
      isEnabled: "文字入力可能なウィンドウを Esc 一回で閉じる",
      helpModal: ``,
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
        In: "場所",
      },
    },
  },
} as const;
