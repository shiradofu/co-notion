import { createCrawlerFn } from "./create";

export class AppCrawler {
  getOverlayContainer = createCrawlerFn(
    () => document.querySelector(".notion-overlay-container"),
    "overlay container not found",
  );

  getI18nedTeamspace = createCrawlerFn(
    () =>
      document.querySelector<HTMLElement>(".notion-outliner-team-header")
        ?.textContent,
    "failed to get translated name of 'Teamspace'",
  );

  getCurrentTeamspaceName = createCrawlerFn(
    () => document.querySelector("header .notion-record-icon + *")?.textContent,
    "current teamspace name not found",
  );
}
