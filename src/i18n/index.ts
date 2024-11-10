import { getObjValueByCtx } from "../utils/obj";
import { enUS } from "./en-US";
import { jaJP } from "./ja-JP";

const tables = {
  "ja-JP": jaJP,
  "en-US": enUS,
} as const;

type TranslationCtx = keyof (typeof tables)["ja-JP"];

export function i(ctx: [TranslationCtx, ...string[]]): string;
export function i<A extends unknown[]>(
  ctx: [TranslationCtx, ...string[]],
  ...args: A
): string;
export function i<A extends unknown[]>(
  ctx: [TranslationCtx, ...string[]],
  ...args: A
) {
  const locale = navigator.language as keyof typeof tables;
  const table = tables[locale] ?? tables["ja-JP"];

  let translated = getObjValueByCtx(table, ctx);
  if (!translated && locale !== "ja-JP") {
    translated = getObjValueByCtx(tables["ja-JP"], ctx);
  }

  if (
    !translated ||
    (args.length === 0 && typeof translated !== "string") ||
    (args.length > 0 && typeof translated !== "function")
  ) {
    throw new Error(`${ctx.join(".")} couldn't be translated`);
  }

  return typeof translated === "function" ? translated(...args) : translated;
}
