import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";
import { Log } from "../utils/log";

type Direction = "Left" | "Center" | "Right";

export class AddKeymapsToAlignImage implements TriggeredByKeymap {
  private app = new AppCrawler();

  keymaps = {
    L: this.createKeyboadEventHandler("Left"),
    C: this.createKeyboadEventHandler("Center"),
    R: this.createKeyboadEventHandler("Right"),
  };

  private createKeyboadEventHandler(dir: Direction) {
    return (e: Event) => {
      const anchorNode = getSelection()?.anchorNode;
      if (
        anchorNode &&
        !(
          anchorNode instanceof HTMLElement &&
          anchorNode.classList.contains("notion-overlay-container")
        )
      ) {
        return;
      }

      let img = document.querySelector<HTMLElement>(
        ".notion-image-block:is(:hover, :has(.notion-selectable-halo))",
      );

      if (!img) {
        for (const i of document.querySelectorAll<HTMLElement>(
          ".notion-image-block",
        )) {
          const button = i.querySelector("[role=button]:has(.ellipsis)");
          if (button?.checkVisibility({ opacityProperty: true })) {
            img = i;
          }
        }
      }

      Log.dbg(img);
      if (!img) return;

      e.stopPropagation();
      this.run(dir, img);
    };
  }

  private async run(dir: Direction, img: HTMLElement) {
    const alignmentButton = createCrawlerFn(
      () =>
        img.querySelector<HTMLElement>(
          "[role=button]:has(:is(.alignLeft, .alignCenter, .alignRight))",
        ),
      "not found if img is small",
    )();

    alignmentButton
      ? this.runForLargeImage(dir, alignmentButton)
      : this.runForSmallImage(dir, img);
  }

  @Log.thrownInMethodAsync
  private async runForLargeImage(dir: Direction, button: HTMLElement) {
    const isAlreadySet = !!button.querySelector(`.align${dir}`);
    if (isAlreadySet) return;

    const overlays = new OverlaysCrawler(this.app.getOverlayContainer("must"));
    const overlaysCount = overlays.count;

    button.click();

    const selectorOverlay = await overlays.ensureCount("must", {
      args: [overlaysCount + 1, { transparent: true }],
      wait: "short",
    });

    const target = await createCrawlerFn(() => {
      return selectorOverlay.querySelector<HTMLElement>(
        `[role=button]:has(.align${dir})`,
      );
    }, `'align${dir}' not found`)("must", { wait: "short" });

    target.click();
  }

  @Log.thrownInMethodAsync
  private async runForSmallImage(dir: Direction, img: HTMLElement) {
    const overlays = new OverlaysCrawler(this.app.getOverlayContainer("must"));
    const overlayCount = overlays.count;

    const ellipsisButton = createCrawlerFn(
      () => img.querySelector<HTMLElement>("[role=button]:has(.ellipsis)"),
      "ellipsis button on image not found",
    )("must");

    ellipsisButton.click();

    const menuOverlay = await overlays.ensureCount("must", {
      wait: "short",
      args: [overlayCount + 1, { transparent: true }],
    });

    const alignmentButton = await createCrawlerFn(
      () =>
        menuOverlay.querySelector<HTMLElement>(
          "[role=menuitem]:has(:is(.alignLeft, .alignCenter, .alignRight))",
        ),
      "open alignment selector",
    )("must", { wait: "short" });

    alignmentButton.click();

    const selectorOverlay = await overlays.ensureCount("must", {
      wait: "short",
      args: [overlayCount + 2, { transparent: true }],
    });

    const target = await createCrawlerFn(
      () =>
        selectorOverlay.querySelector<HTMLElement>(
          `[role=menuitem]:has(.align${dir})`,
        ),
      `'align${dir}' not found`,
    )("must", { wait: "short" });

    target.click();
  }
}
