import { AppCrawler } from "../crawlers/AppCrawler";
import type { ObserverChain } from "../utils/observers";

export class BaseObserver {
  protected app: AppCrawler = new AppCrawler();
  protected observer?: MutationObserver | ObserverChain;

  cleanup() {
    this.observer?.disconnect();
  }
}
