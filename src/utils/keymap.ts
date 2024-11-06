import { Log } from "./log";
import { IS_MACOS } from "./os";

export type KeyboardEventHandler = (e: KeyboardEvent) => void;

const modsRegexp = {
  ctrl: "([Cc]trl|CTRL|[Cc]ontrol|CONTROL)",
  cmd: "([Cc]md|CMD|[Cc]ommand|COMMAND)",
};
const keyStrMapper = [
  [/^([Ee]nter|ENTER|[Rr]eturn|RETURN)$/, "Enter"],
  [/^([Ss]pace|SPACE)$/, " "],
  [/^([Tt]ab|TAB)$/, "Tab"],
  [/^(([Aa]rrow)?[Dd]own|↓)$/, "ArrowDown"],
  [/^(([Aa]rrow)?[Ll]eft|←)$/, "ArrowLeft"],
  [/^(([Aa]rrow)?[Rr]ight|→)$/, "ArrowRight"],
  [/^(([Aa]rrow)?[Uu]p|↑)$/, "ArrowUp"],
  [/^([Ee]nd|END)$/, "End"],
  [/^([Hh]ome|HOME)$/, "Home"],
  [/^[Pp]age[Dd]own$/, "PageDown"],
  [/^[Pp]age[Uu]p$/, "PageUp"],
] as const;

function parseMapStr(mapStr: string) {
  const log = new Log("utils/keymap/parseMapStr");

  const components = !mapStr.endsWith("++")
    ? mapStr.split("+")
    : [...mapStr.split("+").slice(0, -2), "+"];
  const key = components.pop();
  if (!key) {
    log.dbg(`non-mod key not found in mapStr: ${mapStr}`);
    return;
  }
  const mods = components;

  const map: { -readonly [K in "key"]: KeyboardEvent["key"] } & {
    [K in "ctrlKey" | "shiftKey" | "altKey" | "metaKey"]: KeyboardEvent[K];
  } = {
    key: "",
    ctrlKey: !!mods.find(
      (m) =>
        new RegExp(`^${modsRegexp.ctrl}$`).test(m) ||
        (!IS_MACOS &&
          new RegExp(`(^${modsRegexp.ctrl}/|/${modsRegexp.ctrl}$)`).test(m)),
    ),
    shiftKey: !!mods.find((m) => /^([Ss]hift|SHIFT)$/.test(m)),
    altKey: !!mods.find((m) => /^([Aa]lt|ALT|[Oo]pt(ion)?OPT(ION)?)$/.test(m)),
    metaKey: !!mods.find(
      (m) =>
        new RegExp(`^${modsRegexp.cmd}$`).test(m) ||
        (IS_MACOS &&
          new RegExp(`(^${modsRegexp.cmd}/|/${modsRegexp.cmd}$)`).test(m)),
    ),
  };

  if (key.length === 1) {
    map.key = map.shiftKey ? key.toUpperCase() : key.toLowerCase();
  } else {
    for (const [regex, mapped] of keyStrMapper) {
      if (regex.test(key)) {
        map.key = mapped;
        break;
      }
    }
  }

  if (map.key === "") {
    log.dbg(`unknown key "${key}" in "${mapStr}"`);
    return;
  }

  return map;
}

export function createKeyboadEventHandler(
  mapStr: string,
  handler: KeyboardEventHandler,
): KeyboardEventHandler | undefined {
  const map = parseMapStr(mapStr);
  if (!map) return;

  return (e) => {
    if (
      e.key === map.key &&
      e.ctrlKey === map.ctrlKey &&
      e.shiftKey === map.shiftKey &&
      e.metaKey === map.metaKey
    ) {
      handler(e);
    }
  };
}
