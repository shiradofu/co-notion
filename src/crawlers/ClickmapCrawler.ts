import { AppCrawler } from "./AppCrawler";

export class ClickmapCrawler {
  private app = new AppCrawler();
  sidebar = this.app.getSidebar;
  overlayContainer = this.app.getOverlayContainer;
}
