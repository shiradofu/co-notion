import type { FeatureInstanceArr } from "../features";
import {
  type KeyboardEventHandler,
  createKeyboadEventHandler,
} from "../utils/keymap";
import { Log } from "../utils/log";
import type { Deployer } from "./types";

export interface TriggeredByKeymap {
  keymaps: Record<string, KeyboardEventHandler>;
}
const uniqueKey: keyof TriggeredByKeymap = "keymaps";

export class KeymapManager implements Deployer {
  private handlers: KeyboardEventHandler[] = [];
  private log = new Log(this.constructor.name);

  deploy(deployableFeatures: FeatureInstanceArr) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
    for (const f of targetFeatures) {
      for (const [keyCombo, baseHandler] of Object.entries(f.keymaps)) {
        if (!keyCombo) continue;

        const h = createKeyboadEventHandler(keyCombo, baseHandler);
        if (!h) {
          this.log.err(
            `invaild key combo found in ${f.constructor.name}: ${keyCombo}`,
          );
          continue;
        }

        this.handlers.push(h);
        document.body.addEventListener("keydown", h);
      }
    }
  }

  cleanup() {
    for (const h of this.handlers) {
      document.body.removeEventListener("keydown", h);
    }
  }
}
