import type { FeatureConfig } from "../features";
import { ShowInlinePageLinkAsIcon } from "../features/ShowInlinePageLinkAsIcon";
import { i } from "../i18n";
import { appBaseUrl } from "../utils/constants";
import type { Obj } from "../utils/obj";
import type { Primitive } from "../utils/types";
import { type Child, type Children, el } from "./el";

function ctxToId(ctx: string[]) {
  return ctx.join(".");
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
  const labelStr = i(["configUI", ...ctx]);
  const inputId = ctxToId(ctx);

  return el("li", {
    classes: [
      "ConfigListSubgrid",
      ctx.at(-1) === "isEnabled" && "ConfigItem--isEnabled",
    ],
    children: [
      el("label", {
        classes: ["ConfigItemBody", "ConfigListSubgrid"],
        htmlFor: inputId,
        children: [
          extra
            ? el("div", {
                children: [el("div", { children: [labelStr] }), extra],
              })
            : el("div", { children: [labelStr] }),
          el(textarea ? "textarea" : "input", {
            id: inputId,
            classes: [ctx.at(-1) === "keymap" && "font-monospace"],
            value,
            onChange: onChangeInput,
          }),
        ],
      }),
      ...(children ?? []),
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
}: { config: FeatureConfig; onChangeInput: (e: Event) => void }) {
  return el("ul", {
    classes: ["ConfigListRoot"],
    children: Object.entries(config).map(([k, v]) => {
      return ConfigItemTree({ config: v, ctx: [k], onChangeInput });
    }),
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
