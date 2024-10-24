import { jaJP } from "./ja-JP";

const tables = {
  "ja-JP": jaJP,
} as const;

const locale = navigator.language as keyof typeof tables;
const table = tables[locale] ?? tables["ja-JP"];

export function i(text: keyof typeof table) {
  return table[text] ?? text;
}
