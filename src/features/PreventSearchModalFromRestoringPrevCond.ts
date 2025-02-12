import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByOverlayMutation } from "../deployers/OverlayObserver";
import {
  type KeyboardEventHandler,
  createKeyboadEventHandler,
} from "../utils/keymap";
import { Log } from "../utils/log";
import {
  MutationObserved,
  MutationObservedRoot,
  ObserverChain,
  ResizeObserved,
} from "../utils/observers";

export class PreventSearchModalFromRestoringPrevCond
  implements TriggeredByOverlayMutation
{
  private modalEl?: HTMLElement;
  private escListener?: KeyboardEventHandler;
  private log = new Log(this.constructor.name);

  @Log.thrownInMethodSync
  onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    if (overlaysCountDiff <= 0) {
      if (!this.modalEl?.isConnected) {
        this.removeEscListener();
        this.modalEl = undefined;
      }
      return;
    }

    const frontmost = overlays.getFrontmost("may");
    const searchModal = SearchModalCrawler.fromOverlayEl("may", {
      args: [frontmost],
    });
    this.modalEl = searchModal.getModal();

    this.addEscListenerToBody(searchModal);
    this.addClickListenerToSearchModalBg(overlays, searchModal);
    this.addEnterListenerToSearchModal(searchModal);
    this.observeSearchResultItemsToAddClickListener(searchModal);
  }

  @Log.thrownInMethodSync
  private addEscListenerToBody(searchModal: SearchModalCrawler) {
    this.escListener = createKeyboadEventHandler("Escape", () => {
      if (this.modalEl?.isConnected) {
        this.clearSearchModalInput(searchModal, "Esc");
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
      this.clearSearchModalInput(searchModal, "bg click detected");
    });
  }

  @Log.thrownInMethodSync
  private addEnterListenerToSearchModal(searchModal: SearchModalCrawler) {
    const enterListener = createKeyboadEventHandler("Enter", (e) => {
      if (!e.isComposing && this.modalEl?.isConnected) {
        this.clearSearchModalInput(searchModal, "Enter");
      }
    });
    if (!enterListener) throw new Error("failed to create Enter listener");

    this.modalEl?.addEventListener("keydown", enterListener);
  }

  @Log.thrownInMethodAsync
  private async observeSearchResultItemsToAddClickListener(
    searchModal: SearchModalCrawler,
  ) {
    const getSectionsFromContainer = createCrawlerFn(
      (container: HTMLElement) =>
        Array.from(
          container.querySelectorAll<HTMLElement>(
            ":has(> .search-result-body-section-title)",
          ),
        ),
      "it's ok if not found",
    );

    await new ObserverChain(
      new MutationObservedRoot(() => searchModal.getModal(), {
        attributes: true,
        attributeFilter: ["style"],
      }),
      new ResizeObserved((modal) =>
        new SearchModalCrawler(modal).getSearchResultContainer({
          wait: "short",
        }),
      ),
      new MutationObserved(
        (container) =>
          getSectionsFromContainer({ args: [container], wait: "short" }),
        { childList: true },
        (section: HTMLElement) => {
          for (const item of section.children) {
            item.addEventListener("click", () => {
              this.clearSearchModalInput(
                searchModal,
                "search result item click",
              );
            });
          }
        },
      ),
    ).observe();
  }

  private async clearSearchModalInput(
    searchModal: SearchModalCrawler,
    trigger: string,
  ) {
    const clearInputButton = await searchModal.getClearInputButton({
      wait: "short",
    });
    if (!clearInputButton || !clearInputButton.isConnected) {
      this.log.dbg("clear input button not found");
      return;
    }

    this.log.dbg(`${trigger} detected, clear seach modal input`);
    clearInputButton.click();
  }

  private removeEscListener() {
    this.escListener &&
      document.body.removeEventListener("keydown", this.escListener);
    this.escListener = undefined;
  }
}
