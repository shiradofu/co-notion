import { AppCrawler } from "../crawlers/AppCrawler";

export class BaseObserver {
  protected app: AppCrawler = new AppCrawler();
  protected observer?: MutationObserver;

  clear() {
    this.observer?.disconnect();
  }
}
