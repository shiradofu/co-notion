import { createCrawlerFn } from "./create";

export class OverlaysCrawler {
  constructor(private containerEl: Element) {}

  // overlay container always has a child, even if no overlay shown.
  get count() {
    return this.containerEl.childElementCount - 1;
  }

  checkCount = (count: number) => this.count === count;

  ensureCount = createCrawlerFn(
    (
      count: number | "any",
      opts: { transparent: boolean } = { transparent: false },
    ) => {
      if (count !== "any" && !this.checkCount(count)) return null;
      const frontmost = this.containerEl.lastElementChild as HTMLElement | null;
      if (frontmost && opts.transparent) frontmost.style.opacity = "0";
      return frontmost;
    },
    (count: number | "any") => `overlay count is not ${count}`,
  );

  getFrontmostBg = createCrawlerFn(
    () => document.elementFromPoint(0, 0) as HTMLElement | null,
    "failed to get frontmost overlay's background",
  );

  private static _closeFrontmost = () => {
    const bg = document.elementFromPoint(0, 0) as HTMLElement | null;
    bg?.click();
    return bg ? true : null;
  };

  static closeFrontmost = createCrawlerFn(
    OverlaysCrawler._closeFrontmost,
    "failed to click overlay background to close",
  );

  closeFrontmost = createCrawlerFn(
    OverlaysCrawler._closeFrontmost,
    "failed to click overlay background to close",
  );
}
