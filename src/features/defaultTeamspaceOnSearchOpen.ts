import {
  mayGetSearchModalInOverlay,
  mustGetCurrentTeamspaceName,
  mustGetI18nedTeamspace,
  mustGetSearchModalFilterButton,
  mustGetSearchModalFilterMenuItems,
  mustGetSearchModalInput,
} from "../features/crawler";
import { log } from "../utils/log";

export async function setDefaultTeamspaceToSearchFilter(
  overlayContainer: Element,
) {
  if (overlayContainer.childElementCount !== 2) return;

  const overlay1 = overlayContainer.lastElementChild;
  if (!overlay1) return;
  const searchModal = mayGetSearchModalInOverlay(overlay1);
  const i18nedTeamspace = mustGetI18nedTeamspace();
  const teamspaceFilterBtn = mustGetSearchModalFilterButton(
    searchModal,
    i18nedTeamspace,
  );
  if (teamspaceFilterBtn.textContent?.includes(":")) {
    log.dbg("search filter is already set");
    return;
  }

  teamspaceFilterBtn.click();
  const teamspaceFilterItems =
    await mustGetSearchModalFilterMenuItems(overlayContainer);
  log.dbg("teamspace filter items:", teamspaceFilterItems);

  const currentTeamspaceName = mustGetCurrentTeamspaceName();
  for (const item of teamspaceFilterItems) {
    if (item.textContent === currentTeamspaceName) {
      log.dbg(`${currentTeamspaceName} found, set.`);
      item.click();
      break;
    }
  }

  const bg = document.elementFromPoint(0, 0) as HTMLElement | null;
  if (!bg) throw new Error("failed to get element at (0, 0)");
  bg.click();

  const searchInput = mustGetSearchModalInput(searchModal);
  searchInput.focus();
}
