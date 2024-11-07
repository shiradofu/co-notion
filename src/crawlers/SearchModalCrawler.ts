import { createCrawlerFn } from "./create";

const name = "SearchModal";

export class SearchModalCrawler {
  constructor(private modalEl: HTMLElement) {}

  static fromOverlayEl = createCrawlerFn((overlayEl: Element) => {
    const modalEl = overlayEl.querySelector<HTMLElement>(
      "[role=dialog]:has(> .notion-search-menu)",
    );
    return modalEl ? new SearchModalCrawler(modalEl) : null;
  }, "search modal not found");

  getModal() {
    return this.modalEl;
  }

  getTextInput = createCrawlerFn(
    () => this.modalEl.querySelector<HTMLInputElement>('input[type="text"]'),
    "text input not found",
  );

  getFilterBar = createCrawlerFn(
    () =>
      this.modalEl.querySelector<HTMLElement>(".notion-scroller.horizontal"),
    `${name}: filter bar not found`,
  );

  getFilterBarToggle = createCrawlerFn(
    () =>
      this.modalEl.querySelector<HTMLElement>(
        "[role=button][aria-label~=toggle]",
      ),
    `${name}: filter bar toggle button not found`,
  );

  getClearInputButton = createCrawlerFn(
    () =>
      this.modalEl.querySelector<HTMLElement>("[role=button]:has(.clearInput)"),
    "clear input button not found",
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

  getSearchResultContainer = createCrawlerFn(
    () =>
      this.modalEl.querySelector<HTMLElement>(".search-results-list")
        ?.firstElementChild as HTMLElement | null | undefined,
    "search result container not found",
  );
}
