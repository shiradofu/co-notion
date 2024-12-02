import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import type { TriggeredByKeymap } from "../deployers/KeymapManager";
import { i } from "../i18n";
import { el } from "../ui/el";
import { Loading } from "../ui/loading";
import { Log } from "../utils/log";

export class AddKeymapsToCreateNewItemInDB implements TriggeredByKeymap {
  private readonly ctx = ["feature", "addKeymapsToCreateNewItemInDB"] as const;
  private app = new AppCrawler();
  private appContainer?: HTMLElement;
  private loading?: HTMLElement;

  keymaps = {
    "Cmd/Ctrl+O": (e: Event) => {
      e.preventDefault();
      this.run();
    },
  };

  @Log.thrownInMethodAsync
  private async run() {
    const button = this.getItemAddButton();
    if (button) {
      button.click();
      return;
    }

    let timeout = false;
    setTimeout(() => {
      timeout = true;
    }, 5000);

    let navigationCount = 0;
    let buttonFound = false;

    try {
      this.setLoading();
      const startingPath = `${location.pathname}${location.search}`;

      while (!timeout) {
        const destination = await this.tryToGoUp();

        if (destination === false) {
          buttonFound = !!(await this.getItemAddButton({ wait: "long" }));
          break;
        }

        navigationCount++;

        if (new URL(destination).searchParams.has("v")) {
          buttonFound = !!(await this.getItemAddButton({ wait: "long" }));
          break;
        }
      }

      if (timeout) {
        alert(i([...this.ctx, "creationFailed"]));
        return;
      }

      navigationCount !== 0 && history.go(-navigationCount);

      if (!buttonFound) return;

      if (navigationCount === 1) {
        await this.tryToGoUp();
      } else {
        const breadcrumbs = Array.from(
          (
            await this.app.getBreadcrumb("may", { wait: "long" })
          ).querySelectorAll<HTMLElement>("[role=button], a"),
        );

        if (breadcrumbs.length !== 4) {
          throw new Error("breadcrumbs length is not 4");
        }

        const ellipsis = breadcrumbs.at(1);
        if (!ellipsis) {
          throw new Error("failed to get ellipsis i breadcrumbs");
        }

        const overlays = new OverlaysCrawler(
          this.app.getOverlayContainer("must"),
        );
        const overlaysCount = overlays.count;

        ellipsis.click();

        const parentListOverlay = await overlays.ensureCount("must", {
          args: [overlaysCount + 1, { transparent: true }],
          wait: "short",
        });

        const parentItems = Array.from(
          await createCrawlerFn(
            () =>
              parentListOverlay.querySelectorAll<HTMLElement>(
                "[role=menuitem]",
              ),
            "parent list items not found",
          )("must", { wait: "short" }),
        );

        const targetPos = -(navigationCount - 1);
        const target = parentItems.at(targetPos);

        if (!target) {
          throw new Error(`parent list item at ${targetPos} not found`);
        }

        target.click();
      }

      const button = await this.getItemAddButton("must", { wait: "long" });
      history.replaceState(null, "", startingPath);
      button.click();
    } finally {
      this.unsetLoading();
    }
  }

  private getItemAddButton = createCrawlerFn(
    () =>
      document.querySelector<HTMLElement>(
        ".notion-collection-view-item-add > [role=button]",
      ),
    "database item add button not found",
  );

  private async tryToGoUp() {
    const breadcrumb = await this.app.getBreadcrumb("may", { wait: "short" });
    const links = Array.from(
      breadcrumb.querySelectorAll<HTMLAnchorElement>("a"),
    );

    const target = links.at(-1);
    if (!target) return false;

    const breadcrumbRefreshed = new Promise((resolve) => {
      const ob = new MutationObserver(resolve);
      ob.observe(breadcrumb, { childList: true });
    });
    target.click();
    await breadcrumbRefreshed;

    return target.href;
  }

  private async setLoading() {
    const appContainer = this.app.getAppContainer("must");
    appContainer.style.opacity = "0";
    this.appContainer = appContainer;
    this.loading = document.body.appendChild(
      el("div", {
        classes: ["AddKeymapsToCreateNewItemInDB__Loading"],
        children: [Loading()],
      }),
    );
  }

  private unsetLoading() {
    if (this.appContainer) {
      this.appContainer.style.opacity = "1";
    }
    if (this.loading) {
      this.loading.remove();
      this.loading = undefined;
    }
  }
}
