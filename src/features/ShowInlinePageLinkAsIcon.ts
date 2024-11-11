import type { TriggeredByNavigation } from "../conductors/NavigationObserver";
import type { RunBeforeConducted } from "../conductors/breforeConduct";
import type { FeatureConfig } from "../config/feature";
import { AppCrawler } from "../crawlers/AppCrawler";
import { i } from "../i18n";
import { appBaseUrl } from "../utils/constants";
import { Log } from "../utils/log";
import { Storage } from "../utils/storage";

type IconSourcePathname = string;
type IconPageLinkPathname = string;
export type IconPageLinkPathnames = Record<
  IconSourcePathname,
  IconPageLinkPathname[]
>;

export class ShowInlinePageLinkAsIcon
  implements RunBeforeConducted, TriggeredByNavigation
{
  static param = "notion-utils_load-icons" as const;
  private ctx = ["feature", "showInlinePageLinkAsIcon"] as const;
  private sources: { url: string; name?: string }[] = [];

  constructor(config: FeatureConfig["showInlinePageLinkAsIcon"]) {
    this.sources = ShowInlinePageLinkAsIcon.parseIconSourceUrlsStr(
      config.iconSourceUrls,
    );
  }

  static parseIconSourceUrlsStr(str: string) {
    return str
      .split("\n")
      .reverse()
      .reduce<{ name?: string; url: string }[]>((acc, cur) => {
        if (typeof cur !== "string" || !cur) return acc;
        if (cur.startsWith(appBaseUrl)) {
          acc.push({ url: cur, name: "" });
        } else {
          const last = acc.at(-1);
          if (last && !last.name) last.name = cur;
        }
        return acc;
      }, [])
      .reverse();
  }

  get css() {
    const inlineLinkClasses = [
      ".notion-page-mention-token",
      ".notion-text-mention-token",
      ".notion-focusable-token",
      ".notion-enable-hover",
    ];

    const iconSize = "1.5em";

    return Storage.local.get("iconPageLinkPathnames").then((saved) => {
      return `main a${inlineLinkClasses.join("")}:is(${Array.from(
        new Set(Object.values(saved).flat()),
      )
        .map((pathname) => `[href^="${pathname}"]`)
        .join(",")}) {
  display: inline-flex !important;

  img {
    width: ${iconSize} !important;
    height: ${iconSize} !important;
  }

  span:has(img) {
    display: flex !important;
  }

  span:has(> img) {
    width: ${iconSize} !important;
    margin: 0 0.1em !important;
  }

  svg, span:not(:has(img)) {
    display: none !important;
  }
}
`;
    });
  }

  async beforeConducted() {
    await this.deleteUnlisted();
  }

  onNavigate(urlStr: string) {
    const url = new URL(urlStr);
    this.sources.find((source) => this.isEqUrl(url, new URL(source.url))) &&
      this.crawl(url);
  }

  private async deleteUnlisted() {
    const sourcePathnames = this.sources.map((s) => new URL(s.url).pathname);
    const saved = await Storage.local.get("iconPageLinkPathnames");
    const del = Object.keys(saved).filter((p) => !sourcePathnames.includes(p));
    if (del.length === 0) return;
    for (const d of del) delete saved[d];
    await Storage.local.set("iconPageLinkPathnames", saved);
  }

  private isEqUrl(url1: URL, url2: URL) {
    return url1.origin === url2.origin && url1.pathname === url2.pathname;
  }

  @Log.thrownInMethodAsync
  private async crawl(url: URL) {
    const app = new AppCrawler();
    const links = await app.getInternalLinksInMainContent({ wait: "long" });
    if (!links) return;

    const found = Array.from(links).map((a) => new URL(a.href).pathname);

    if (found.length > 0) {
      const saved = await Storage.local.get("iconPageLinkPathnames");
      saved[url.pathname] = Array.from(new Set(found));
      await Storage.local.set("iconPageLinkPathnames", saved);

      const explicit = url.searchParams.has(ShowInlinePageLinkAsIcon.param);
      if (!explicit) return;
      alert(i([...this.ctx, "crawlSuccess"], found.length));
    } else {
      alert(i([...this.ctx, "crawlFailure"]));
    }
    Log.dbg(await Storage.local.get("iconPageLinkPathnames"));
  }
}
