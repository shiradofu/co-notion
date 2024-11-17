import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";

type Direction = "Left" | "Center" | "Right";

export class AddKeymapsToAlignSelectedImage implements TriggeredByKeymap {
  private app = new AppCrawler();

  keymaps = {
    L: this.createKeyboadEventHandler("Left"),
    C: this.createKeyboadEventHandler("Center"),
    R: this.createKeyboadEventHandler("Right"),
  };

  private createKeyboadEventHandler(dir: Direction) {
    return (e: Event) => {
      const img = document.querySelector<HTMLElement>(
        ".notion-image-block:has(.notion-selectable-halo)",
      );
      if (!img) return;
      e.stopPropagation();
      this.run(dir, img);
    };
  }

  private async run(dir: Direction, img: HTMLElement) {
    const openPlacementSelectorButton = createCrawlerFn(
      () =>
        img.querySelector<HTMLElement>(
          "[role=button]:has(:is(.alignLeft, .alignCenter, .alignRight))",
        ),
      "open placement selector button not found",
    )("must");

    const isAlreadySet = !!openPlacementSelectorButton.querySelector(
      `.align${dir}`,
    );
    if (isAlreadySet) return;

    openPlacementSelectorButton.click();

    const overlays = new OverlaysCrawler(this.app.getOverlayContainer("must"));
    const target = await createCrawlerFn(
      () =>
        overlays
          .getFrontmost()
          ?.querySelector<HTMLElement>(
            `[role=dialog] [role=button]:has(.align${dir})`,
          ),
      "placement selector not found",
    )("must", { wait: "short" });

    target.click();
  }
}
