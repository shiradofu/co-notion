import type { FeatureInstances } from "../features";
import {
  type KeyboardEventHandler,
  createKeyboadEventHandler,
} from "../utils/keymap";
import { log } from "../utils/log";
import type { Conductor } from "./types";

export interface TriggeredByKeymap {
  keymaps: Record<string, KeyboardEventHandler>;
}
const uniqueKey: keyof TriggeredByKeymap = "keymaps";

export class KeymapManager implements Conductor {
  private handlers: KeyboardEventHandler[] = [];

  conduct(features: FeatureInstances) {
    const targets = features.filter((f) => uniqueKey in f);
    for (const t of targets) {
      for (const [mapStr, baseHandler] of Object.entries(t.keymaps)) {
        const h = createKeyboadEventHandler(mapStr, baseHandler);
        if (!h) {
          log.err(`invaild keymap found: ${mapStr}`);
          continue;
        }
        document.body.addEventListener("keydown", h);
      }
    }
  }

  clear() {
    for (const h of this.handlers) {
      document.body.removeEventListener("keydown", h);
    }
  }
}
