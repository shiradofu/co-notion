import { getObjValueByCtx } from "../utils/obj";
import { enUS } from "./en-US";
import { jaJP } from "./ja-JP";

const tables = {
  "ja-JP": jaJP,
  "en-US": enUS,
} as const;

type TranslationCtx = keyof (typeof tables)["ja-JP"];

export function i(ctx: [TranslationCtx, ...string[]]) {
  const locale = navigator.language as keyof typeof tables;
  const table = tables[locale] ?? tables["ja-JP"];
  let translated = getObjValueByCtx(table, ctx);
  if (!translated && locale !== "ja-JP") {
    translated = getObjValueByCtx(tables["ja-JP"], ctx);
  }
  if (!translated || typeof translated !== "string") {
    throw new Error(`${ctx.join(".")} couldn't be translated`);
  }
  return translated;
}
