import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";
import type { TriggeredByOverlayMutation } from "../deployers/OverlayObserver";
import { Log } from "../utils/log";
import {
  MutationObservedRoot,
  ObserverChain,
  ResizeObserved,
} from "../utils/observers";
import { StaticStyle } from "./StaticStyle";

export class RemoveNotionAI
  extends StaticStyle
  implements TriggeredByOverlayMutation, TriggeredByKeymap
{
  keymaps = {
    Space: (e: Event) => {
      console.log(e);
      if (!document.activeElement?.classList.contains("whenContentEditable")) {
        return;
      }
      if (getSelection()?.anchorNode?.textContent !== "") {
        return;
      }
      e.preventDefault();
      document.execCommand("insertText", false, " ");
    },
  };

  @Log.thrownInMethodSync
  onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    if (overlays.checkCount(1) && overlaysCountDiff > 0) {
      const searchModal = SearchModalCrawler.fromOverlayEl("may", {
        args: [overlays.getFrontmost("may")],
      });
      this.removeFromSearchResultItems(searchModal);
    }
  }

  private async removeFromSearchResultItems(searchModal: SearchModalCrawler) {
    const removeAI = (el: HTMLElement) => {
      const menu = el.querySelector<HTMLElement>("[role=menu]");
      if (!menu) return;
      const firstSectionItems =
        menu.firstElementChild?.querySelectorAll<HTMLElement>(
          "[role=menuitem]",
        );
      if (
        firstSectionItems &&
        firstSectionItems.length === 1 &&
        firstSectionItems[0].querySelector("[alt='Notion AI face']")
      ) {
        menu.firstElementChild?.remove();
      }
    };

    await new ObserverChain(
      new MutationObservedRoot(
        () => searchModal.getModal(),
        { attributes: true, attributeFilter: ["style"] },
        (modalEl) => {
          if (new SearchModalCrawler(modalEl).getSearchResultContainer()) {
            return;
          }
          removeAI(modalEl);
        },
      ),
      new ResizeObserved(
        (modal) =>
          new SearchModalCrawler(modal).getSearchResultContainer({
            wait: "short",
          }),
        {},
        (containerEl) => removeAI(containerEl),
      ),
    ).observe();
  }
}
