import { createCrawlerFn } from "./create";

export class AppCrawler {
  getNotionLang = createCrawlerFn(
    () => document.documentElement.lang,
    "failed to get lang",
  );

  getOverlayContainer = createCrawlerFn(
    () => document.querySelector<HTMLElement>(".notion-overlay-container"),
    "overlay container not found",
  );

  getI18nedTeamspace = createCrawlerFn(
    () =>
      document.querySelector<HTMLElement>(".notion-outliner-team-header")
        ?.textContent,
    "failed to get translated name of 'Teamspace'",
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
