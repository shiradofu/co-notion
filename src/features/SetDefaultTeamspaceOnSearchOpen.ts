import type { TriggeredByClick } from "../conductors/ClickmapManager";
import type { TriggeredByKeymap } from "../conductors/KeymapManager";
import type { TriggeredByOverlayMutation } from "../conductors/OverlayObserver";
import type { FeatureConfig } from "../config/feature";
import { AppCrawler } from "../crawlers/AppCrawler";
import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import { i } from "../i18n";
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

  onMutateOverlay(overlays: OverlaysCrawler, overlaysCountDiff: number) {
    if (overlaysCountDiff > 0) {
      this.run(overlays);
    }
  }

  @Log.thrownInMethodAsync
  private async run(overlays: OverlaysCrawler) {
    // TODO: move conds to onMutateOverlay
    if (!this.checkTriggered()) return;
    overlays.ensureCount("may", { args: [1] });

    const app = new AppCrawler();
    const localLog = this.log.local(".run");

    // cannot get this when we're at "Home" tab, private page, etc.
    const currentTeamspaceName = app.getCurrentTeamspaceName("may");

    const modal = SearchModalCrawler.fromOverlayEl("may", {
      args: [overlays.getFrontmost("may")],
    });

    const areFiltersShown = modal.getFilterBar();
    if (!areFiltersShown) {
      const toggle = await modal.getFilterBarToggle("must", {
        wait: "short",
      });
      toggle.click();
    }

    const teamspaceFilterBtn = await modal.getFilterButton("must", {
      args: [i(["notionTerms", "Teamspace"])],
      wait: "short",
    });
    if (teamspaceFilterBtn.textContent?.includes(":")) {
      throw "search filter is already set";
    }

    teamspaceFilterBtn.click();
    await overlays.ensureCount("must", { args: [2], wait: "short" });

    const teamspaceFilterItems = await modal.getFilterItems("must", {
      args: [overlays.getFrontmost("must")],
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

    overlays.closeFrontmost("must");
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
