import type { FeatureConfig } from ".";
import { AppCrawler } from "../crawlers/AppCrawler";
import type { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { SearchModalCrawler } from "../crawlers/SearchModalCrawler";
import type { TriggeredByClick } from "../deployers/ClickmapManager";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";
import type { TriggeredByOverlayMutation } from "../deployers/OverlayObserver";
import { i } from "../i18n";
import { Log } from "../utils/log";

export class SetDefaultTeamspaceOnSearchOpen
  implements TriggeredByOverlayMutation, TriggeredByKeymap, TriggeredByClick
{
  private app = new AppCrawler();
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
    if (overlaysCountDiff > 0 && this.checkTriggered()) {
      overlays.ensureCount("may", { args: [1] });
      this.run(overlays);
    }
  }

  @Log.thrownInMethodAsync
  private async run(overlays: OverlaysCrawler) {
    const modal = SearchModalCrawler.fromOverlayEl("may", {
      args: [overlays.getFrontmost("may")],
    });

    const isGuest = !this.app.getTeamspaceTreeContainer();
    if (isGuest) {
      if (this.config.useInPageFilterIfImGuest) {
        this.setInPageFilter(overlays, modal);
      }
      return;
    }

    this.setTeamspaceFilter(overlays, modal);
  }

  @Log.thrownInMethodAsync
  private async setTeamspaceFilter(
    overlays: OverlaysCrawler,
    modal: SearchModalCrawler,
  ) {
    // cannot get this when we're at "Home" tab, private page, etc.
    const currentTeamspaceName = this.app.getCurrentTeamspaceName("may");

    await this.ensureFilterBarShown(modal);

    const teamspaceFilterBtn = await modal.getFilterButton("must", {
      args: [i(["notionTerms", "Teamspace"])],
      wait: "short",
    });
    if (teamspaceFilterBtn.textContent?.includes(":")) {
      throw "search filter is already set";
    }

    const isFilterSet = await this.setFilter(
      overlays,
      modal,
      teamspaceFilterBtn,
      currentTeamspaceName,
    );

    // when in private page, filter won't be found
    if (!isFilterSet) throw "target filter not found";
  }

  @Log.thrownInMethodAsync
  private async setInPageFilter(
    overlays: OverlaysCrawler,
    modal: SearchModalCrawler,
  ) {
    const rootPageName = this.app.getRootPageName("may");

    await this.ensureFilterBarShown(modal);

    const inPageFilterBtn = await modal.getFilterButton("must", {
      args: [i(["notionTerms", "searchModal", "filterBar", "In"])],
      wait: "short",
    });
    if (inPageFilterBtn.textContent?.includes(":")) {
      throw "search filter is already set";
    }

    const isFilterSet = await this.setFilter(
      overlays,
      modal,
      inPageFilterBtn,
      rootPageName,
    );

    if (!isFilterSet) throw new Error("target filter not found");
  }

  private async ensureFilterBarShown(modal: SearchModalCrawler) {
    const areFiltersShown = modal.getFilterBar();
    if (!areFiltersShown) {
      const toggle = await modal.getFilterBarToggle("must", {
        wait: "short",
      });
      toggle.click();
    }
  }

  private async setFilter(
    overlays: OverlaysCrawler,
    modal: SearchModalCrawler,
    filterBtn: HTMLElement,
    targetName: string,
  ) {
    filterBtn.click();
    await overlays.ensureCount("must", { args: [2], wait: "short" });

    const filterItems = await modal.getFilterItems("must", {
      args: [overlays.getFrontmost("must")],
      wait: "short",
    });

    let targetFilterFound = false;
    for (const item of filterItems) {
      const itemName = item?.firstElementChild?.lastElementChild?.textContent;
      if (itemName === targetName) {
        this.log.dbg(`${targetName} found, set.`);
        targetFilterFound = true;
        item.click();
        break;
      }
    }

    this.closeFilterSelectionModal(overlays, modal);

    return targetFilterFound;
  }

  private closeFilterSelectionModal(
    overlays: OverlaysCrawler,
    modal: SearchModalCrawler,
  ) {
    overlays.closeFrontmost("must");
    modal.getTextInput("must").focus();
  }

  private checkTriggered() {
    const bool = this.triggered;
    this.triggered = false;
    return bool;
  }
}
