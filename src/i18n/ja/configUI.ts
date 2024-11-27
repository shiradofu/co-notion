import type { FeatureConfig } from "../../features";
import { CMD_OR_CTRL } from "../../utils/os";
import type { DeepT } from "../../utils/types";
import { notionTerms as t } from "./notionTerms";

const submit = "設定を保存";

const useRecommended = {
  label: "おすすめ設定を使用",
  helpModal: `
  「インストールしたけれど、どこから始めていいかわからない」

  「細かい調整はあとでするから、とりあえずいい感じに使いたい」

  という方向けにおすすめ設定を作りました。基本的にはほとんどの機能がオンに
  なります。オンにしただけでは機能せず、追加の設定が必要なものもあり、
  それらはこのヘルプの下にまとめています。

  間違って押してしまっても、「${submit}」をクリックせずに設定画面を閉じれば保存
  せずに終了できますのでご安心ください。

  ## 追加の設定が必要なもの

  【インラインリンクをアイコンとして表示】

  【プロフィールページへのリンクをショートカットで挿入】

  の2つについては追加で設定が必要になりますので、個別のヘルプをご覧ください。

  【ギャラリービューにピン留め表示を追加】

  は co-notion 上での設定は必要ありませんが、Notion のデータベースで設定が
  必要です。こちらもヘルプをご覧ください。

  ## オンにならないものについて

  【検索時に自動で現在のチームスペースを指定】以下

  全てオンにしない方が便利なので、ひとまず ${CMD_OR_CTRL}+K のみをオンにしています。
  設定のヘルプも見つつ、好みに合わせて調整してください。

  【Notion AI を非表示】

  ゲストの方の場合は関係ないので、ひとまずオフにしています。

  【キーボードショートカット関連(最後のほうの設定)】

  キーボードショートカットは使わない方もいらっしゃるので、おすすめではオフに
  しています。
  `,
};

const setDefaultTeamspaceOnSearchOpen = {
  isEnabled: "検索時に自動で現在のチームスペースを指定",
  isEnabledOnCmdOrCtrlP: "Cmd/Ctrl+P で検索を開いたとき",
  isEnabledOnCmdOrCtrlK: "Cmd/Ctrl+K で検索を開いたとき",
  isEnabledOnClick: "サイドバーの「検索」をクリックして開いたとき",
  useInPageFilterIfImGuest: `自分がゲストのときは「${t.searchModal.filterBar.In}」フィルタを使う`,
  helpModal: `
    ワークスペースの検索時に、自動で現在のチームスペースをフィルタにセットします。
    「自分がゲストのときは『${t.searchModal.filterBar.In}』フィルタを使う」
    をオンにしておくと、招待されたファイルでは「${t.searchModal.filterBar.In}」
    フィルタを使用します。

    ## 機能の背景

    Notion では、ワークスペース全体を検索できる検索窓
    を ${CMD_OR_CTRL}+P か ${CMD_OR_CTRL}+K、もしくは左のサイドバーの「検索」から
    開くことができます。

    デフォルトでは自分がアクセスできるすべてのページからの検索となりますが、ページ数が
    増えてくると検索結果に関係のないページが入り込み、目的のページを見つける難易度が
    上がります。

    検索では手動でフィルタを設定することができ、検索窓の右にある ≡ ボタンを押すと、

    ![img] setDefaultTeamspaceOnSearchOpen-filterbar-closed.webp

    フィルタのリストが出てきて、結果を絞り込むことができます。

    ![img] setDefaultTeamspaceOnSearchOpen-filterbar-opened.webp

    自分が今開いているページと関連のあるページを検索したい場合、「チームスペース」
    フィルタ(自分がゲストの場合は「${t.searchModal.filterBar.In}」フィルタ)
    を設定するとよいですが、毎回手動で設定するのは面倒です。

    この機能をオンにしておくと、特定の方法で検索を開いたときに自動でフィルタを
    設定することができます。

    (ワークスペース全体から検索できると便利なことも多いので、両方使えるようにしておく
    のがおすすめです。)
    `,
};

const preventSearchModalFromRestoringPrevCond = {
  isEnabled: "前回の検索条件を復元しない",
  helpModal: `
    「${setDefaultTeamspaceOnSearchOpen.isEnabled}」を使用する場合はこちらも
    オンにしておくことをおすすめします。

    Notion では検索終了後、再び検索を開くとフィルタなども含めて前回の検索条件が
    復元されます。検索条件が復元された場合はフィルタの上書きを行わないので、
    確実に自動フィルタ設定を機能させたい場合はこちらもあわせてお使いください。
    `,
};

const showInlinePageLinkAsIcon = {
  isEnabled: "インラインリンクをアイコンとして表示",
  iconSourceUrls: "アイコン表示したいページを含んだDBのURL",
  reload: (target: string) => `「${target}」を読込`,
  helpModal: `
    特定のデータベース(DB)に属するページへのインラインリンクをアイコンとして
    表示させることができます。
    誰かの文章に自分の意見を追記するときなど、発言者を明示したい場合に便利です。

    例えば、自己紹介用のDBを作成し、各ページのアイコンにメンバーのプロフィール
    画像を設定、DBのURLをこちらの機能に登録すると、DB内の自己紹介ファイルへの
    メンション(インラインリンク)がアイコンとして表示されます。

    ![img] showInlinePageLinkAsIcon-usecase.webp

    ## 使用方法

    まず、DBのURLをビューのタブをクリックして表示される「ビューのリンクをコピー」
    からコピーします。

    ![img] showInlinePageLinkAsIcon-db-url.webp

    そして、この設定の記入欄の1行目に自分がわかりやすいDBの名前を入力し、
    2行目にDBのURLを貼り付けてください。
    DB名は Notion で設定されているDBの名前と一致させる必要はありません。

    「${submit}」をクリックすると「(DB名)を読込」と書かれたボタンが表示される
    ので続いてクリックし、Notion で DB が表示されれば準備は完了です。
    以降、その時点でDB内にあるファイルへのインラインリンクはアイコンとして
    表示されます。

    ![img] showInlinePageLinkAsIcon-example.webp

    DB内に新しいファイルが増えた場合は、設定画面から再び「(DB名)を読込」を
    実行してください。

    データベースは複数登録できます。
    3行目以降にも同じ書き方で続けて書くことができます。
    DB名は省略できますが、省略すると画面表示が崩れることがあるので指定することを
    おすすめします。

    ## インラインリンクとは

    Notion の機能の一つで、文中に他のページへのリンクを挿入することができます。
    作成方法はいくつかありますが、[[ と入力すると「ページリンクを作成」という
    ポップアップが出てくるので、そこでリンクしたいページ名を入力することで
    作成できます。

    ![img] showInlinePageLinkAsIcon-inline-link.webp
    `,
};

const addKeymapToInsertProfilePageLink = {
  isEnabled: "プロフィールページへのリンクをショートカットで挿入",
  profilePageTitle: "プロフィールページ名",
  keymap: "キーボードショートカット",
  helpModal: `
  「${showInlinePageLinkAsIcon.isEnabled}」でアイコン表示できるようにした
  自分のプロフィールページへのリンクを、ショートカットで簡単に作成できる
  ようにします。

  「プロフィールページ名」には、アイコンに自分のプロフィール画像が登録
  してあるプロフィールページのタイトルを入力してください。

  デフォルトのショートカットは ${CMD_OR_CTRL}+I ですが、これはイタリック体の
  切り替えのショートカットと同じなので、そちらをよく使う方は変更をお願いします。
  `,
};

const alwaysShowsDatabaseMenubar = {
  isEnabled: "データベースのメニューバーを常に表示",
  helpModal: `
  データベースの右肩に表示されるメニューはマウスカーソルが上にあるときにのみ
  表示されますが、これを常に表示するようにします。

  常に表示すると「新規」の青色が少し目立ちすぎるので、他のメニューと同じ
  落ち着いた色にそろえています。

  ![img] alwaysShowsDatabaseMenubar-example.webp
  `,
};

const addPinnedIndicatorToGallery = {
  isEnabled: "ギャラリービューにピン留め表示を追加",
  hideCheckbox: "チェックボックスを非表示",
  helpModal: `
  ギャラリービューにチェックボックスのプロパティを作成し、
  それを並び替えに利用してピン留め機能を再現していることを前提とした機能です。

  ギャラリービューにチェックボックスのプロパティを表示し、かつそのプロパティが
  プロパティの中で一番上に配置されている場合に、チェックの入ったページに
  ピン留めされていることが分かるマーク(タイトル右上に薄い二重線)を表示します。

  ## 動作イメージ

  こちらの画像は「チェックボックスを非表示」もオンにした状態です。

  ![img] AddPinnedIndicatorToGallery-example.webp
  `,
};

const makeGalleryPreivewFontSizeAllTheSame = {
  isEnabled: "ギャラリービューのプレビューのフォントサイズを揃える",
  helpModal: `
  ギャラリービューのプレビュー部分で見出しが大きく表示されると見づらい
  場合、この機能でフォントサイズを小さくそろえることができます。

  ## Before

  ![img] makeGalleryPreivewFontSizeAllTheSame-before.webp

  ## After

  ![img] makeGalleryPreivewFontSizeAllTheSame-after.webp
  `,
};

const placeGalleryPreviewAtTheBottom = {
  isEnabled: "ギャラリービューのプレビューを下に配置",
  helpModal: `
  ギャラリービューのプレビューを一番下に配置します。プレビューに表示
  されるものが画像ではなく文字中心の場合は、こちらの方が見やすいかも
  しれません。

  ## Before

  ![img] placeGalleryPreviewAtTheBottom-before.webp

  ## After

  ![img] placeGalleryPreviewAtTheBottom-after.webp
  `,
};

const restrictGalleryTitleLength = {
  isEnabled: "ギャラリービューのタイトルの長さを制限",
  helpModal: `
  ギャラリービューのタイトルは、デフォルトではどれだけ長くても全て表示
  されます。長すぎるタイトルは余計な余白を生み、全体の見た目を崩して
  しまうことがあるので、途中までしか表示しないようにします。

  ## Before

  ![img] restrictGalleryTitleLength-before.webp

  ## After

  ![img] restrictGalleryTitleLength-after.webp
  `,
};

const removeHoverMenuFromGalleryView = {
  isEnabled: "ギャラリービューのホバーメニューを非表示",
  helpModal: `
  ギャラリービューのページにカーソルを合わせたときに出てくるボタンを
  非表示にします。あまり使わないのに間違えて押してしまう、という方はぜひ
  ご利用ください。

  ![img] removeHoverMenuFromGalleryView-target.webp
  `,
};

const removeHoverMenuFromBoardView = {
  isEnabled: "ボードビューのホバーメニューを非表示",
  helpModal: `
  ボードビューのページにカーソルを合わせたときに出てくるボタンを
  非表示にします。使用頻度は高くないけれど間違って押す頻度は高い、という
  方は奮ってご活用ください。

  ![img] removeHoverMenuFromBoardView-target.webp
  `,
};

const removePlaceholderOnEmptyLine = {
  isEnabled: "空行に表示されるプレースホルダを非表示",
  helpModal: `
  何も記入していない行に表示される、薄いけれど微妙に主張の強い文字を非表示
  にします。

  ![img] removePlaceholderOnEmptyLine-target.webp
  `,
};

const addIndentationLinesToIndentedItems = {
  isEnabled: "箇条書きなどの階層がわかりやすいように線を表示",
  helpModal: `
  Tab キーで字下げをして作成された階層がわかりやすいように、行頭に薄い
  ラインを表示します。

  通常のテキスト、箇条書き、順序付きリスト、ToDoリストに対応しています。

  ![img] addIndentationLinesToIndentedItems-example.webp
  `,
};

const showPropertiesInSingleLine = {
  isEnabled: "ページのプロパティを1行で表示",
  helpModal: `
  プロパティが増えてくると、ページ上部をプロパティの行が圧迫してしまいます。
  これを防ぐためにプロパティを1行で表示させます。
  1行になったプロパティは横にスクロールでき、編集、追加なども可能です。
  (並び替えもできますが、少々やりづらいです)

  ## Before

  ![img] showPropertiesInSingleLine-before.webp

  ## After

  ![img] showPropertiesInSingleLine-after.webp
  `,
};

const fixFavicon = {
  isEnabled: "タブに表示するアイコンを常に同じにする",
  helpModal: `
  Notion はページを移動するごとに、タブに表示されるアイコン(ファビコン)を
  ページに設定しているアイコンに変更します。アイコンが変わるとタブ上で
  Notion を見つけづらくて困る、という人向けの機能です。
  `,
};

const removeNotionAI = {
  isEnabled: "Notion AI を非表示",
  helpModal: `
  あちらこちらに表示されるNotion AI を非表示にします。
  この機能を有効にしても ${CMD_OR_CTRL}+J からは起動できますので、必要な
  場合はそちらからどうぞ。

  (この機能はワークスペースのメンバーのみが対象です。ゲストの方は Notion AI が
  最初から無効になっているので、この機能を使用する必要はありません)
  `,
};

const addKeymapsToAlignImage = {
  isEnabled: "選択中の画像の整列指定にショートカットを追加",
  helpModal: `
  文字入力中ではなく、かつ

  画像のオプションが表示されている状態<br/>
  (マウスカーソルが乗っている状態)

  ![img] addKeymapsToAlignImage-hovered.webp

  または

  画像を選択した状態<br/>
  (画像がうっすら青くなった状態)

  ![img] addKeymapsToAlignImage-selected.webp

  で「L・C・R」キーのいずれかを押すと、それぞれ画像を左、中央、右にそろえることができます。
  `,
};

const closeInputableDialogOnSingleEsc = {
  isEnabled: "文字入力可能なダイアログを Esc 一回で閉じる",
  helpModal: `
  文字入力可能なダイアログで Esc キーを押すと、まず入力からフォーカスが外れ、その後に
  ダイアログが閉じる、という動きをします。これが冗長だと感じる場合、機能を有効にする
  ことで Esc 一回でダイアログを閉じることができるようになります。
  `,
};

export const configUI: DeepT<
  { [K in keyof FeatureConfig]: FeatureConfig[K] & { helpModal: string } } & {
    submit: typeof submit;
    useRecommended: typeof useRecommended;
  },
  string
> = {
  submit,
  useRecommended,
  setDefaultTeamspaceOnSearchOpen,
  preventSearchModalFromRestoringPrevCond,
  showInlinePageLinkAsIcon,
  addKeymapToInsertProfilePageLink,
  addPinnedIndicatorToGallery,
  alwaysShowsDatabaseMenubar,
  makeGalleryPreivewFontSizeAllTheSame,
  placeGalleryPreviewAtTheBottom,
  restrictGalleryTitleLength,
  removeHoverMenuFromGalleryView,
  removeHoverMenuFromBoardView,
  removePlaceholderOnEmptyLine,
  addIndentationLinesToIndentedItems,
  showPropertiesInSingleLine,
  fixFavicon,
  removeNotionAI,
  addKeymapsToAlignImage,
  closeInputableDialogOnSingleEsc,
};
