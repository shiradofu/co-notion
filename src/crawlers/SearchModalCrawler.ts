import { createCrawlerFn } from "./create";

const name = "SearchModal";

export class SearchModalCrawler {
  constructor(private modalEl: Element) {}

  static fromOverlayEl = createCrawlerFn((overlayEl: Element) => {
    const modalEl = overlayEl.querySelector<HTMLElement>(".notion-search-menu");
    return modalEl ? new SearchModalCrawler(modalEl) : null;
  }, "search modal not found");

  getTextInput = createCrawlerFn(
    () => this.modalEl.querySelector<HTMLElement>('input[type="text"]'),
    "text input not found",
  );

  getFilterBar = createCrawlerFn(
    () =>
      this.modalEl.querySelector<HTMLElement>(".notion-scroller.horizontal"),
    `${name}: filter bar not found`,
  );

  getFilterBarToggle = createCrawlerFn(
    () => this.modalEl.querySelector<HTMLElement>("[role=button]"),
    `${name}: filter bar toggle button not found`,
  );

  getFilterButton = createCrawlerFn(
    (label: string) =>
      document
        .evaluate(
          `.//*[contains(@class, "notion-scroller")]//*[text()[contains(., "${label}")]]`,
          this.modalEl,
        )
        .iterateNext() as HTMLElement | null,
    (label) => `${name}: filter button (${label}) not found`,
  );

  getFilterItems = createCrawlerFn(
    (overlayEl: Element) =>
      overlayEl.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    "filter items not found",
    { isSuccessFn: (result) => result && result.length > 0 },
  );
}
