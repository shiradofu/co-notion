import { createCrawlerFn } from "./create";

export class OverlaysCrawler {
  constructor(private containerEl: Element) {}

  // overlay container always has a child, even if no overlay shown.
  get count() {
    return this.containerEl.childElementCount - 1;
  }

  ensureCount = createCrawlerFn(
    (count: number) => this.count === count,
    (count) => `overlay count is not ${count}`,
  );

  getFrontmost = createCrawlerFn(
    () => this.containerEl.lastElementChild,
    "no overlay found",
  );

  closeFrontmost = createCrawlerFn(() => {
    const bg = document.elementFromPoint(0, 0) as HTMLElement | null;
    bg?.click();
    return bg ? true : null;
  }, "failed to click overlay background to close");
}
