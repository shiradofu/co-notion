import type { SelfConducted } from "../conductors/SelfConductor";
import type { Speculative } from "../conductors/SpeculativeConductor";
import { AppCrawler } from "../crawlers/AppCrawler";
import { appBaseUrl } from "../utils/constants";
import { Log } from "../utils/log";

export class FixFavicon implements Speculative, SelfConducted {
  private origFavicon?: string;
  private faviconUrl = `${appBaseUrl}images/favicon.ico`;
  private app = new AppCrawler();
  private log = new Log(this.constructor.name);

  static speculativeNew() {
    return new FixFavicon();
  }

  speculate() {
    return this.run();
  }

  conductSelf(wasCleanedup: boolean) {
    if (!wasCleanedup) return;
    return this.run();
  }

  private run() {
    const observer = new MutationObserver(([{ target }]) => {
      if (!(target instanceof HTMLLinkElement)) return;
      if (target.href === this.faviconUrl) return;
      this.replaceFavicon(target);
    });

    const faviconEl = this.app.getFavicon();
    if (!faviconEl) {
      this.log.err("failed to get favicon link element");
      return;
    }

    this.log.dbg("start watching favicon...");
    observer.observe(faviconEl, {
      attributes: true,
      attributeFilter: ["href"],
    });
    this.replaceFavicon(faviconEl);

    return () => {
      observer?.disconnect();
      this.log.dbg(this.origFavicon);
      if (this.origFavicon) faviconEl.href = this.origFavicon;
    };
  }

  private replaceFavicon(faviconEl: HTMLLinkElement) {
    this.origFavicon = faviconEl.href;
    faviconEl.href = this.faviconUrl;
  }
}
