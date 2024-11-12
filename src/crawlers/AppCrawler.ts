import { createCrawlerFn } from "./create";

export class AppCrawler {
  getFavicon = createCrawlerFn(
    () => document.querySelector<HTMLLinkElement>('link[rel~="icon"]'),
    "favicon not found",
  );

  getNotionLang = createCrawlerFn(
    () => document.documentElement.lang,
    "failed to get lang",
  );

  getOverlayContainer = createCrawlerFn(
    () => document.querySelector<HTMLElement>(".notion-overlay-container"),
    "overlay container not found",
  );

  getCurrentTeamspaceName = createCrawlerFn(
    () =>
      document.querySelector<HTMLElement>("header .notion-record-icon + *")
        ?.textContent,
    "current teamspace name not found",
  );

  getSidebar = createCrawlerFn(
    () => document.querySelector<HTMLElement>(".notion-sidebar"),
    "sidebar not found",
  );

  getMain = createCrawlerFn(
    () => document.querySelector("main"),
    "main not found",
  );

  getInternalLinksInMainContent = createCrawlerFn(
    () => document.querySelectorAll<HTMLAnchorElement>('main a[href^="/"]'),
    "internal links in main not found",
    { isSuccessFn: (result) => result.length > 0 },
  );
}
