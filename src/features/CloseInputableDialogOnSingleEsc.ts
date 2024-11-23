import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByClick } from "../deployers/ClickmapManager";
import type { TriggeredByOverlayMutation } from "../deployers/OverlayObserver";
import { Log } from "../utils/log";

export class CloseInputableDialogOnSingleEsc
  implements TriggeredByOverlayMutation, TriggeredByClick
{
  private overlayContainerClicked = false;
  private log = new Log(this.constructor.name);

  clickmaps = {
    overlayContainer: () => {
      this.overlayContainerClicked = true;
      setTimeout(() => {
        this.overlayContainerClicked = false;
      }, 10);
    },
  };

  onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    if (overlaysCountDiff > 0) {
      this.run(overlays);
    }
  }

  @Log.thrownInMethodAsync
  private async run(overlays: OverlaysCrawler) {
    const frontmost = overlays.getFrontmost("may");

    const input = await createCrawlerFn(
      () =>
        frontmost.querySelector(
          ":is(.notion-peek-renderer [role=textbox], input)",
        ),
      "it's ok if not found",
    )({ wait: "short" });
    if (!input) {
      this.log.dbg("input not found");
      return;
    }
    this.log.dbg("input found");

    input.addEventListener("blur", (e) => {
      if (this.overlayContainerClicked) {
        this.log.dbg("click detected, cancel");
        return;
      }
      const t = e.currentTarget;
      if (!(t instanceof HTMLElement)) return;
      setTimeout(() => {
        t.isConnected &&
          document.activeElement?.nodeName === "BODY" &&
          overlays.closeFrontmost();
      });
    });
  }
}
