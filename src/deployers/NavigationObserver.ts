import { AppCrawler } from "../crawlers/AppCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { FeatureInstanceArrRO } from "../features";
import { Log } from "../utils/log";
import {
  MutationObserved,
  MutationObservedRoot,
  ObserverChain,
} from "../utils/observers";
import { BaseObserver } from "./BaseObserver";
import type { Deployer } from "./types";

export interface TriggeredByNavigation {
  onNavigate: (url: string) => void;
}
const uniqueKey: keyof TriggeredByNavigation = "onNavigate";

export class NavigationObserver extends BaseObserver implements Deployer {
  private url?: string;

  @Log.thrownInMethodAsync
  async deploy(deployableFeatures: FeatureInstanceArrRO) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
    if (targetFeatures.length === 0) return;

    this.observer = new ObserverChain(
      new MutationObservedRoot(
        () => new AppCrawler().getAppContainer({ wait: "long" }),
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
