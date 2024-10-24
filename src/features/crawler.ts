const MAX_RETRY = 50;
const interval = {
  init: 300,
  click: 10,
} as const;

async function checkInterval<R>(
  type: keyof typeof interval,
  fn: () => R | Promise<R>,
) {
  return await new Promise<R | undefined>((resolve) => {
    let n = 0;
    const tid = setInterval(async () => {
      if (n > MAX_RETRY) {
        clearInterval(tid);
        resolve(undefined);
      }
      const result = await fn();
      if (result !== undefined && result !== null) {
        clearInterval(tid);
        resolve(result);
      }
      n++;
    }, interval[type]);
  });
}

function auxiliary(type: "must" | "may") {
  return <T extends unknown[], R>(
    fn: (...args: T) => R,
    msg: string | ((...args: T) => string),
  ) =>
    (...args: T): NonNullable<R> => {
      const result = fn(...args);
      const msgString = typeof msg === "string" ? msg : msg(...args);
      if (!result) throw type === "must" ? new Error(msgString) : msgString;
      return result;
    };
}

function asyncAuxiliary(type: "must" | "may") {
  return <T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    msg: string | ((...args: T) => string),
  ) =>
    async (...args: T): Promise<NonNullable<R>> => {
      const result = await fn(...args);
      const msgString = typeof msg === "string" ? msg : msg(...args);
      if (!result) throw type === "must" ? new Error(msgString) : msgString;
      return result;
    };
}

const must = auxiliary("must");
const may = auxiliary("may");
const asyncMust = asyncAuxiliary("must");
// const asyncMay = asyncAuxiliary("may");

export async function getOverlayContainer() {
  return await checkInterval("init", () =>
    document.querySelector(".notion-overlay-container"),
  );
}
export const mustGetOverlayContainer = asyncMust(
  getOverlayContainer,
  "failed to get overlay container",
);

export function getCurrentTeamspaceName() {
  return document.querySelector("header")?.textContent?.split("/")?.at(0);
}
export const mustGetCurrentTeamspaceName = must(
  getCurrentTeamspaceName,
  "failed to get current teamspace name",
);

export function getI18nedTeamspace() {
  return document.querySelector<HTMLElement>(".notion-outliner-team-header")
    ?.textContent;
}
export const mustGetI18nedTeamspace = must(
  getI18nedTeamspace,
  "failed to get translated name of 'Teamspace'",
);

export function getSearchModalInOverlay(overlay: Element) {
  return overlay.querySelector<HTMLElement>(".notion-search-menu");
}
export const mayGetSearchModalInOverlay = may(
  getSearchModalInOverlay,
  "search modal not foudn",
);

export function getSearchModalFilterButton(
  searchModal: Element,
  label: string,
) {
  return document
    .evaluate(
      `.//*[contains(@class, "notion-scroller")]//*[text()[contains(., "${label}")]]`,
      searchModal,
    )
    .iterateNext() as HTMLElement | null;
}

export function getSearchModalInput(searchModal: Element) {
  return searchModal.querySelector<HTMLElement>('input[type="text"]');
}
export const mustGetSearchModalInput = must(
  getSearchModalInput,
  "failed to get input on search modal",
);

export const mustGetSearchModalFilterButton = must(
  getSearchModalFilterButton,
  (_, label) => `failed to get search modal filter ${label}`,
);

export async function getSearchModalFilterMenuItems(overlayContainer: Element) {
  return await checkInterval("click", () => {
    if (overlayContainer.childElementCount !== 3) return;
    const overlay = overlayContainer.lastElementChild;
    if (!overlay) return [];
    return Array.from(
      overlay.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
  });
}

export async function mustGetSearchModalFilterMenuItems(
  overlayContainer: Element,
) {
  const result = await getSearchModalFilterMenuItems(overlayContainer);
  if (!result || result.length === 0) {
    throw new Error("failed to get search modal filter menuitems");
  }
  return result;
}
