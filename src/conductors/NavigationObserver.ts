import { createCrawlerFn } from "../crawlers/create";
import type { FeatureInstances } from "../features";
import {
  MutationObserved,
  MutationObservedRoot,
  ObserverChain,
} from "../utils/observers";
import { BaseObserver } from "./BaseObserver";
import type { Conductor } from "./types";

export interface TriggeredByNavigation {
  onNavigate: (url: string) => void;
}
const uniqueKey: keyof TriggeredByNavigation = "onNavigate";

export class NavigationObserver extends BaseObserver implements Conductor {
  private url?: string;

  async conduct(enabledFeatures: FeatureInstances) {
    const targetFeatures = enabledFeatures.filter((f) => uniqueKey in f);
    if (targetFeatures.length === 0) return;

    this.observer = new ObserverChain(
      new MutationObservedRoot(
        () =>
          createCrawlerFn(
            () =>
              document.querySelector<HTMLElement>(".notion-cursor-listener"),
            "failed to get notion-cursor-listener",
          )({ wait: "long" }),
        { childList: true },
        () => this.isNavigated() && this.run(targetFeatures),
      ),
      new MutationObserved(
        () => this.app.getMain({ wait: "long" }),
        { childList: true },
        () => this.isNavigated() && this.run(targetFeatures),
      ),
    );

    this.observer.observe();
  }

  private run(features: TriggeredByNavigation[]) {
    if (!this.url) return;
    for (const f of features) {
      f.onNavigate(this.url);
    }
  }

  private isNavigated() {
    if (this.url === location.href) return false;
    this.url = location.href;
    return true;
  }
}
