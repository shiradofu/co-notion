import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";
import { Log } from "../utils/log";
import type { FeatureConfigRO } from "./config";

export class AddKeymapToInsertProfilePageLink implements TriggeredByKeymap {
  constructor(
    private config: FeatureConfigRO["addKeymapToInsertProfilePageLink"],
  ) {}

  keymaps = {
    [this.config.keymap]: (e: KeyboardEvent) => {
      e.stopPropagation();
      this.run();
    },
  };

  @Log.thrownInMethodAsync
  private async run() {
    const app = new AppCrawler();
    const overlaysEl = app.getOverlayContainer("must");
    const overlays = new OverlaysCrawler(overlaysEl);
    const overlaysCount = overlays.count;

    const currentNode = getSelection()?.anchorNode;
    const focusedEl =
      currentNode instanceof HTMLElement
        ? currentNode
        : currentNode?.parentElement;
    if (!focusedEl || !focusedEl.isContentEditable) return;

    document.execCommand("insertText", false, "[");
    await new Promise((resolve) =>
      setTimeout(() => {
        document.execCommand(
          "insertText",
          false,
          `[${this.config.profilePageTitle}`,
        );
        resolve(true);
      }, 10),
    );

    const frontmost = await overlays.ensureCount("must", {
      args: [overlaysCount + 1, { transparent: false }],
      wait: "short",
    });

    const target = await createCrawlerFn(() => {
      const items = frontmost.querySelectorAll<HTMLElement>("[role=menuitem]");
      for (const item of items) {
        if (item.textContent?.startsWith(this.config.profilePageTitle)) {
          return item;
        }
      }
    }, "failed to get profile page link in candidate items")("must", {
      wait: "short",
    });

    target.click();
  }
}
