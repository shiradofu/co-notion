import { createCrawlerFn } from "./create";

export class OverlayContainerCrawler {
  constructor(private containerEl: Element) {}

  getChildrenCount = createCrawlerFn(
    () => this.containerEl.childElementCount,
    "failed to get overlay container children count",
  );

  checkChildrenCount = createCrawlerFn(
    (count: number) => this.containerEl.childElementCount === count,
    (count) => `overlay count is not ${count}`,
  );

  getFrontmostOverlay = createCrawlerFn(
    () => this.containerEl.lastElementChild,
    "no overlay found",
  );

  closeFrontMostOverlay = createCrawlerFn(() => {
    const bg = document.elementFromPoint(0, 0) as HTMLElement | null;
    if (!bg) return null;
    bg.click();
    return true;
  }, "failed to click overlay background to close");
}
