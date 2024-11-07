import type { TriggeredByOverlayMutation } from "../conductors/OverlayObserver";
import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import {
  type KeyboardEventHandler,
  createKeyboadEventHandler,
} from "../utils/keymap";
import { Log } from "../utils/log";

export class PreventSearchModalFromRestoringPrevCond
  implements TriggeredByOverlayMutation
{
  private escListener?: KeyboardEventHandler;
  private log = new Log(this.constructor.name);

  @Log.thrownInMethodSync
  onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    if (overlays.checkCount(0)) return this.removeEscListener();
    if (overlays.checkCount(1) && overlaysCountDiff > 0) {
      const searchModal = SearchModalCrawler.fromOverlayEl("may", {
        args: [overlays.getFrontmost("may")],
      });
      this.addEscListenerToBody(overlays, searchModal);
      this.addClickListenerToSearchModalBg(overlays, searchModal);
      this.addEnterListenerToSearchModal(overlays, searchModal);
      this.observeSearchResultItemsToAddClickListener(searchModal);
    }
  }

  @Log.thrownInMethodSync
  private addEscListenerToBody(
    overlays: OverlaysCrawler,
    searchModal: SearchModalCrawler,
  ) {
    if (this.escListener) this.removeEscListener();

    this.escListener = createKeyboadEventHandler("Escape", () => {
      if (overlays.checkCount(1)) {
        this.log.dbg("Esc detected, clear seach modal input");
        this.clearSearchModalInput(searchModal);
      }
    });
    if (!this.escListener) throw new Error("failed to create Esc listener");

    document.body.addEventListener("keydown", this.escListener);
  }

  @Log.thrownInMethodSync
  private addClickListenerToSearchModalBg(
    overlays: OverlaysCrawler,
    searchModal: SearchModalCrawler,
  ) {
    overlays.getFrontmostBg("must").addEventListener("click", () => {
      this.log.dbg("bg click detected, clear seach modal input");
      this.clearSearchModalInput(searchModal);
    });
  }

  @Log.thrownInMethodSync
  private addEnterListenerToSearchModal(
    overlays: OverlaysCrawler,
    searchModal: SearchModalCrawler,
  ) {
    const modalEl = searchModal.getModal();

    const enterListener = createKeyboadEventHandler("Enter", (e) => {
      if (!e.isComposing && overlays.checkCount(1)) {
        this.log.dbg("Enter detected, clear seach modal input");
        this.clearSearchModalInput(searchModal);
      }
    });
    if (!enterListener) throw new Error("failed to create Enter listener");

    modalEl.addEventListener("keydown", enterListener);
  }

  @Log.thrownInMethodSync
  private observeSearchResultItemsToAddClickListener(
    searchModal: SearchModalCrawler,
  ) {
    const addClickListenerToSectionChildren = (section: HTMLElement) => {
      for (const item of section.children) {
        item.addEventListener("click", () => {
          this.log.dbg(
            "search result item click detected, clear seach modal input",
          );
          this.clearSearchModalInput(searchModal);
        });
      }
    };

    const getSectionsFromContainer = (container: HTMLElement) => {
      return container.querySelectorAll<HTMLElement>(
        ":has(> .search-result-body-section-title)",
      );
    };

    const searchResultSectionsObserver = new MutationObserver(([record]) => {
      const section = record.target as HTMLElement;
      this.log.dbg(
        "search result changed, add click listeners to items:",
        section.children,
      );
      addClickListenerToSectionChildren(section);
    });

    const searchResultContainerObserver = new MutationObserver(([record]) => {
      this.log.dbg(
        "search result container children changed, start observing search result sections",
      );
      const searchResultContainer = record.target as HTMLElement;
      const searchResultSections = getSectionsFromContainer(
        searchResultContainer,
      );
      this.log.dbg(length, searchResultSections.length);
      for (const section of searchResultSections) {
        this.log.dbg({ section });
        addClickListenerToSectionChildren(section);
        searchResultSectionsObserver.observe(section, { childList: true });
      }
    });

    const modalObserver = new MutationObserver(([record]) => {
      const modal = new SearchModalCrawler(record.target as HTMLElement);
      const searchResultContainer = modal.getSearchResultContainer();
      if (!searchResultContainer) return;

      this.log.dbg(
        "modal style changed, start observing search result container",
      );
      searchResultContainerObserver.observe(searchResultContainer, {
        childList: true,
      });
    });

    searchModal
      .getSearchResultContainer({ wait: "short" })
      .then((container) => {
        if (!container) return;
        const sections = getSectionsFromContainer(container);
        for (const sec of sections) {
          addClickListenerToSectionChildren(sec);
        }
      });

    modalObserver.observe(searchModal.getModal(), {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  private async clearSearchModalInput(searchModal: SearchModalCrawler) {
    const clearInputButton = await searchModal.getClearInputButton({
      wait: "short",
    });
    if (!clearInputButton || !clearInputButton.isConnected) {
      this.log.dbg("clear input button not found");
      return;
    }
    clearInputButton.click();
  }

  private removeEscListener() {
    this.escListener &&
      document.body.removeEventListener("keydown", this.escListener);
    this.escListener = undefined;
  }
}
