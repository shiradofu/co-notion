import type { AppCrawler } from "../crawlers/AppCrawler";
import type { OverlayContainerCrawler } from "../crawlers/OverlayContainerCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import { log, logThrownAsync } from "../utils/log";

export class SetDefaultTeamspaceOnSearchOpen {
  @logThrownAsync
  async run(
    app: AppCrawler,
    overlayContainer: OverlayContainerCrawler,
    overlayCountDiff: number,
  ) {
    if (overlayCountDiff <= 0) return;
    overlayContainer.checkChildrenCount("may", { args: [2] });

    // cannot get this when we're at "Home" tab, private page, etc.
    const currentTeamspaceName = app.getCurrentTeamspaceName("may");

    const modal = SearchModalCrawler.fromOverlayEl("may", {
      args: [overlayContainer.getFrontmostOverlay("may")],
    });

    const areFiltersShown = modal.getFilterBar();
    if (!areFiltersShown) {
      const toggle = await modal.getFilterBarToggle("must", {
        wait: "short",
      });
      toggle.click();
    }

    const i18nedTeamspace = app.getI18nedTeamspace("must");
    const teamspaceFilterBtn = await modal.getFilterButton("must", {
      args: [i18nedTeamspace],
      wait: "short",
    });
    if (teamspaceFilterBtn.textContent?.includes(":")) {
      throw "search filter is already set";
    }

    teamspaceFilterBtn.click();
    await overlayContainer.checkChildrenCount("must", {
      args: [3],
      wait: "short",
    });
    const teamspaceFilterItems = await modal.getFilterItems("must", {
      args: [overlayContainer.getFrontmostOverlay("must")],
      wait: "short",
    });
    log.dbg("teamspace filter items:", teamspaceFilterItems);

    let currentTeamspaceFilterFound = false;
    for (const item of teamspaceFilterItems) {
      const itemName = item?.firstElementChild?.lastElementChild?.textContent;
      if (itemName === currentTeamspaceName) {
        log.dbg(`${currentTeamspaceName} found, set.`);
        currentTeamspaceFilterFound = true;
        item.click();
        break;
      }
    }
    if (!currentTeamspaceFilterFound) {
      throw new Error("current teamspace filter not found");
    }

    overlayContainer.closeFrontMostOverlay("must");
    modal.getTextInput("must").focus();
  }
}
