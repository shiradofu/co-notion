import { AppCrawler } from "../crawlers/AppCrawler";
import { appBaseUrl } from "../utils/constants";
import { Log } from "../utils/log";
import { getObjValueByCtx } from "../utils/obj";
import { Storage } from "../utils/storage";
import { enUS } from "./en-US";
import { jaJP } from "./ja-JP";

const tables = {
  ja: jaJP,
  en: enUS,
} as const;

export type AvailableLang = keyof typeof tables;
type TranslationCtx = keyof (typeof tables)["ja"];

let lang: AvailableLang = "ja";

function checkavAvailability(lang: string): lang is AvailableLang {
  return lang in tables;
}

export async function setLang() {
  const savedLang = await Storage.local.get("lang");

  if (!location.href.startsWith(appBaseUrl)) {
    if (savedLang) lang = savedLang;
    return;
  }

  const notionLang = await new AppCrawler().getNotionLang({ wait: "long" });
  if (!notionLang) {
    new Log("setLang").err("failed to get language used in Notion app");
    if (savedLang) lang = savedLang;
    return;
  }

  if (!checkavAvailability(notionLang)) {
    if (savedLang) lang = savedLang;
    return;
  }

  lang = notionLang;
  Storage.local.set("lang", lang);
}

export function i(ctx: [TranslationCtx, ...string[]]): string;
export function i<A extends unknown[]>(
  ctx: [TranslationCtx, ...string[]],
  ...args: A
): string;
export function i<A extends unknown[]>(
  ctx: [TranslationCtx, ...string[]],
  ...args: A
) {
  const table = tables[lang] ?? tables.ja;

  let translated = getObjValueByCtx(table, ctx);
  if (translated === undefined && lang !== "ja") {
    translated = getObjValueByCtx(tables.ja, ctx);
  }

  if (
    translated === undefined ||
    (args.length === 0 && typeof translated !== "string") ||
    (args.length > 0 && typeof translated !== "function")
  ) {
    throw new Error(`${ctx.join(".")} couldn't be translated`);
  }

  return typeof translated === "function" ? translated(...args) : translated;
}
