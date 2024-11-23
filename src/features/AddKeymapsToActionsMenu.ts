import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";
import type { TriggeredByOverlayMutation } from "../deployers/OverlayObserver";
import { el } from "../ui/el";
import { Log } from "../utils/log";
import { StaticStyle } from "./StaticStyle";

export class AddKeymapsToActionsMenu
  extends StaticStyle
  implements TriggeredByKeymap, TriggeredByOverlayMutation
{
  private app = new AppCrawler();
  private log = new Log(this.constructor.name);
  private buttons: {
    smallText?: HTMLElement;
    fullWidth?: HTMLElement;
    lockPage?: HTMLElement;
  } = {};

  private readonly buttonNameToKey: {
    [K in keyof typeof this.buttons]-?: string;
  } = {
    smallText: "S",
    fullWidth: "F",
    lockPage: "L",
  };

  private readonly buttonNameToIconClass: {
    [K in keyof typeof this.buttons]-?: string;
  } = {
    smallText: "smallTextIcon",
    fullWidth: "arrowsOut",
    lockPage: "locked",
  };

  readonly keymaps = {
    "Cmd/Ctrl+;": () => {
      const b = Object.values(this.buttons).at(0);
      if (b) {
        OverlaysCrawler.closeFrontmost();
        return;
      }

      for (const container of [this.app.getPeekRenderer(), document]) {
        if (!container) continue;
        const button = container.querySelector<HTMLElement>(
          ".notion-topbar-more-button",
        );
        if (button) {
          button.click();
          return;
        }
      }
      this.log.dbg("actions button not found");
    },
    [this.buttonNameToKey.smallText]:
      this.createKeyboadEventHandler("smallText"),
    [this.buttonNameToKey.fullWidth]:
      this.createKeyboadEventHandler("fullWidth"),
    [this.buttonNameToKey.lockPage]: this.createKeyboadEventHandler("lockPage"),
  };

  @Log.thrownInMethodAsync
  async onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    const b = Object.values(this.buttons).at(0);
    if (b && !b.isConnected) {
      this.buttons = {};
      return;
    }

    if (overlaysCountDiff <= 0) return;
    const frontmost = overlays.getFrontmost("may");

    const items = await createCrawlerFn(
      () => {
        if (!frontmost.isConnected) return false;
        return frontmost.querySelectorAll<HTMLElement>(
          "[role=menuitem]:has([role=switch]):has(svg)",
        );
      },
      "actions menu not found",
      { shouldFinishFn: (result) => result === false || result.length > 0 },
    )({ wait: "short" });

    if (!items) return;

    const check = (k: string): k is keyof typeof this.buttonNameToIconClass =>
      k in this.buttonNameToIconClass;

    for (const item of items) {
      for (const [name, icon] of Object.entries(this.buttonNameToIconClass)) {
        if (!check(name)) return;
        if (!this.buttons[name] && item.querySelector(`.${icon}`)) {
          this.buttons[name] = item;
          this.addKeyText(name);
        }
      }
    }
  }

  private createKeyboadEventHandler(name: keyof typeof this.buttons) {
    return (e: Event) => {
      if (!this.buttons[name]) return;
      e.stopPropagation();
      this.buttons[name].click();
    };
  }

  @Log.thrownInMethodSync
  private addKeyText(name: keyof typeof this.buttons) {
    const button = this.buttons[name];
    const inner = button?.firstElementChild;
    if (!button || !inner || inner.childElementCount > 3) return;

    const keyComboDescEl = el("div", {
      classes: [`${this.constructor.name}__text`],
      children: [this.buttonNameToKey[name].toUpperCase()],
    });

    inner.insertBefore(keyComboDescEl, inner.lastElementChild);
  }
}
