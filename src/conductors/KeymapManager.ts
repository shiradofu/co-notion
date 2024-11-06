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

  conduct(enabledFeatures: FeatureInstances) {
    const targetFeatures = enabledFeatures.filter((f) => uniqueKey in f);
    for (const f of targetFeatures) {
      for (const [mapStr, baseHandler] of Object.entries(f.keymaps)) {
        const h = createKeyboadEventHandler(mapStr, baseHandler);
        if (!h) {
          log.err(`invaild keymap found in ${f.constructor.name}: ${mapStr}`);
          continue;
        }

        this.handlers.push(h);
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
