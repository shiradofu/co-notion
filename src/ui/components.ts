import type { FeatureConfigRO } from "../features";
import { ShowInlinePageLinkAsIcon } from "../features/ShowInlinePageLinkAsIcon";
import { i } from "../i18n";
import { STORE_DESCRIPTION_END, appBaseUrl } from "../utils/constants";
import type { Obj } from "../utils/obj";
import type { Primitive } from "../utils/types";
import { type Child, type Children, type ElAttrsWithChildren, el } from "./el";

function ctxToId(ctx: string[]) {
  return ctx.join(".");
}

function ctxToHelpModalId(ctx: string[]) {
  return `HelpModal.${ctxToId(ctx)}`;
}

function showHelpModal(ctx: string[]) {
  const modal = document.getElementById(ctxToHelpModalId(ctx));
  if (!(modal instanceof HTMLDialogElement)) {
    throw new Error(`invalid modal: ${ctx}`);
  }
  modal.showModal();
}

function Modal({ children, classes, ...rest }: ElAttrsWithChildren<"dialog">) {
  const dialog = el("dialog", {
    ...rest,
    children: [el("div", { classes: ["Modal__Content"], children })],
    classes: ["Modal", ...(classes ?? [])],
  });

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  return dialog;
}

const spaceBetweenWords = i(["spaceBetweenWords"]);
function renderHelpModalContent(ctx: string[], ctxForTitle = "isEnabled") {
  return `# ${i(["configUI", ...ctx, ctxForTitle])}

    ${i(["configUI", ...ctx, "helpModal"])}`
    .trim()
    .split("\n\n")
    .filter((paragraph) => paragraph.trim() !== STORE_DESCRIPTION_END)
    .map((paragraph) =>
      paragraph.trim().replaceAll(/\n\s*/g, spaceBetweenWords),
    )
    .map((line) =>
      line.startsWith("![img] ")
        ? el("img", { src: `./assets/${line.slice(7)}` })
        : line.startsWith("# ")
          ? el("h1", { children: [line.slice(2)] })
          : line.startsWith("## ")
            ? el("h2", { children: [line.slice(3)] })
            : el("p", {
                children: line.split("<br/>").flatMap((l) => [l, el("br")]),
              }),
    );
}

function HelpModal({
  ctx,
  ctxForTitle,
}: { ctx: string[]; ctxForTitle?: string }) {
  return Modal({
    id: ctxToHelpModalId(ctx),
    children: renderHelpModalContent(ctx, ctxForTitle),
  });
}

function QuestionMark({ onClick }: { onClick: () => void }) {
  return el("div", {
    children: ["?"],
    classes: ["ConfigLabel__Q"],
    onClick,
  });
}

function ConfigLabel({ ctx, htmlFor }: { ctx: string[]; htmlFor: string }) {
  const labelStr = i(["configUI", ...ctx]);
  const q =
    ctx.at(-1) === "isEnabled" &&
    QuestionMark({
      onClick: () => showHelpModal(ctx.slice(0, -1)),
    });

  return el("div", {
    classes: ["ConfigLabel"],
    children: [el("label", { htmlFor, children: [labelStr] }), q],
  });
}

function ConfigItem({
  ctx,
  value,
  onChangeInput,
  textarea,
  extra,
  children,
}: {
  ctx: string[];
  value: Primitive;
  onChangeInput: (e: Event) => void;
  textarea?: boolean;
  extra?: Child;
  children?: Children;
}) {
  const inputId = ctxToId(ctx);
  const isIsEnabled = ctx.at(-1) === "isEnabled";

  return el("li", {
    classes: ["ConfigListSubgrid", isIsEnabled && "ConfigItem--isEnabled"],
    children: [
      el("div", {
        classes: ["ConfigItemBody", "ConfigListSubgrid"],
        children: [
          el("div", {
            children: [ConfigLabel({ ctx, htmlFor: inputId }), extra],
          }),
          el(textarea ? "textarea" : "input", {
            id: inputId,
            classes: [ctx.at(-1) === "keymap" && "font-monospace"],
            value,
            onChange: onChangeInput,
          }),
        ],
      }),
      ...(children ?? []),
      isIsEnabled && HelpModal({ ctx: ctx.slice(0, -1) }),
    ],
  });
}

function ConfigSubList({ children }: { children: Children }) {
  return el("ul", {
    classes: ["ConfigSubList", "ConfigListSubgrid"],
    children,
  });
}

function ConfigItemTree({
  config,
  ctx,
  onChangeInput,
}: {
  config: Obj;
  ctx: string[];
  onChangeInput: (e: Event) => void;
}): HTMLElement {
  if (!("isEnabled" in config && typeof config.isEnabled === "boolean")) {
    throw new Error(`${ctxToId(ctx)} doesn't have 'isEnabled'`);
  }

  const { isEnabled, ...rest } = config;
  const subConfig = Object.entries(rest);

  return ConfigItem({
    ctx: [...ctx, "isEnabled"],
    value: isEnabled,
    onChangeInput,
    children: [
      subConfig.length > 0 &&
        ConfigSubList({
          children: subConfig.map(([k, v]) => {
            const newCtx = [...ctx, k];

            if (["boolean", "string", "number"].includes(typeof v)) {
              return ConfigItem({
                ctx: newCtx,
                value: v as Primitive,
                onChangeInput,
                ...makeCustomItemProps(newCtx, v as Primitive),
              });
            }

            return ConfigItemTree({
              config: v as Obj,
              ctx: newCtx,
              onChangeInput,
            });
          }),
        }),
    ],
  });
}

export function ConfigList({
  config,
  onChangeInput,
}: { config: FeatureConfigRO; onChangeInput: (e: Event) => void }) {
  return el("ul", {
    classes: ["ConfigListRoot"],
    children: Object.entries(config).map(([k, v]) => {
      return ConfigItemTree({ config: v, ctx: [k], onChangeInput });
    }),
  });
}

export function UseRecommended({ onClick }: { onClick: () => void }) {
  const ctx = ["useRecommended"];

  return el("div", {
    classes: ["UseRecommended"],
    children: [
      el("button", {
        classes: ["UseRecommended__Button"],
        children: [i(["configUI", ...ctx, "label"])],
        onClick: (e) => {
          e.preventDefault();
          onClick();
        },
      }),
      QuestionMark({
        onClick: () => showHelpModal(ctx),
      }),
      HelpModal({ ctx, ctxForTitle: "label" }),
    ],
  });
}

export function ConfigFormSubmission({ isSuccess }: { isSuccess?: boolean }) {
  return el("div", {
    classes: ["ConfigFormSubmission"],
    children: [
      isSuccess !== undefined &&
        el("i", {
          children: [isSuccess ? "✓" : "×"],
          classes: [
            "ConfigFormSubmission__Status",
            isSuccess
              ? "ConfigFormSubmission__Status--success"
              : "ConfigFormSubmission__Status--failure",
          ],
        }),
      el("button", {
        type: "submit",
        classes: ["ConfigFormSubmission__Button"],
        children: [i(["configUI", "submit"])],
      }),
    ],
  });
}

export function ConfigFormFooter({
  children,
}: { children: [NonNullable<Child>, NonNullable<Child>] }) {
  return el("footer", {
    classes: ["ConfigFormFooter"],
    children,
  });
}

function makeCustomItemProps(
  ctx: string[],
  value: Primitive,
): Partial<Parameters<typeof ConfigItem>[0]> {
  const id = ctxToId(ctx);

  if (id === "showInlinePageLinkAsIcon.iconSourceUrls") {
    if (typeof value !== "string") {
      throw new Error(`${id} is not string: ${value}`);
    }

    const sources = ShowInlinePageLinkAsIcon.parseIconSourceUrlsStr(value);
    const parentCtx = ctx.slice(0, -1);
    const extra = el("div", {
      classes: ["ConfigItemBody__IconSourceReloadLinks"],
      children: sources.map((source) => {
        const url = new URL(source.url);
        url.searchParams.append(ShowInlinePageLinkAsIcon.param, "1");

        return el("a", {
          href: url.toString(),
          children: [
            i(
              ["configUI", ...parentCtx, "reload"],
              source.name || source.url.substring(appBaseUrl.length),
            ),
          ],
        });
      }),
    });

    return {
      extra,
      textarea: true,
    };
  }

  return {};
}
