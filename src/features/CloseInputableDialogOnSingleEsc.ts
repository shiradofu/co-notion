import type { TriggeredByClick } from "../conductors/ClickmapManager";
import type { TriggeredByOverlayMutation } from "../conductors/OverlayObserver";
import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { Log } from "../utils/log";

export class CloseInputableDialogOnSingleEsc
  implements TriggeredByOverlayMutation, TriggeredByClick
{
  private overlayContainerClicked = false;
  private log = new Log(this.constructor.name);

  onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    if (overlaysCountDiff > 0) {
      this.run(overlays);
    }
  }

  clickmaps = {
    overlayContainer: () => {
      this.overlayContainerClicked = true;
      setTimeout(() => {
        this.overlayContainerClicked = false;
      }, 10);
    },
  };

  @Log.thrownInMethodAsync
  private async run(overlays: OverlaysCrawler) {
    const overlay = overlays.getFrontmost("may");

    const input = overlay.querySelector<HTMLElement>("input");
    if (!input) {
      this.log.dbg("input not found");
      return;
    }
    this.log.dbg("input found");

    input.addEventListener("blur", (e) => {
      if (this.overlayContainerClicked) {
        this.log.dbg("click detected, stop running");
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
