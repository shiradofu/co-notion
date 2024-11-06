import type { TriggeredByClick } from "../conductors/ClickmapManager";
import type { TriggeredByKeymap } from "../conductors/KeymapManager";
import type { TriggeredByOverlayMutation } from "../conductors/OverlayObserver";
import type { FeatureConfig } from "../config/feature";
import { AppCrawler } from "../crawlers/AppCrawler";
import type { OverlayContainerCrawler } from "../crawlers/OverlayContainerCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import { Log } from "../utils/log";

export class SetDefaultTeamspaceOnSearchOpen
  implements TriggeredByOverlayMutation, TriggeredByKeymap, TriggeredByClick
{
  private triggered = false;
  private log = new Log(this.constructor.name);

  constructor(
    private config: FeatureConfig["setDefaultTeamspaceOnSearchOpen"],
  ) {}

  keymaps = {
    "Cmd/Ctrl+P": () => {
      this.triggered = this.config.isEnabledOnCmdOrCtrlP;
    },
    "Cmd/Ctrl+K": () => {
      this.triggered = this.config.isEnabledOnCmdOrCtrlK;
    },
  };

  clickmaps = {
    sidebar: () => {
      this.triggered = this.config.isEnabledOnClick;
    },
  };

  onMutateOverlay(
    overlayContainer: OverlayContainerCrawler,
    overlayCountDiff: number,
  ) {
    if (overlayCountDiff <= 0) return;
    this.run(overlayContainer);
  }

  @Log.thrownInMethodAsync
  private async run(overlayContainer: OverlayContainerCrawler) {
    if (!this.checkTriggered()) return;
    overlayContainer.checkChildrenCount("may", { args: [2] });

    const app = new AppCrawler();
    const localLog = this.log.local(".run");

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
    localLog.dbg("teamspace filter items:", teamspaceFilterItems);

    let currentTeamspaceFilterFound = false;
    for (const item of teamspaceFilterItems) {
      const itemName = item?.firstElementChild?.lastElementChild?.textContent;
      if (itemName === currentTeamspaceName) {
        localLog.dbg(`${currentTeamspaceName} found, set.`);
        currentTeamspaceFilterFound = true;
        item.click();
        break;
      }
    }

    overlayContainer.closeFrontMostOverlay("must");
    modal.getTextInput("must").focus();

    // when in private page, filter won't be found
    if (!currentTeamspaceFilterFound) {
      throw `filter "${currentTeamspaceName}" not found`;
    }
  }

  private checkTriggered() {
    const bool = this.triggered;
    this.triggered = false;
    return bool;
  }
}
