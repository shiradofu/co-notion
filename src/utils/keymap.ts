import { Log } from "./log";
import { IS_MACOS } from "./os";

export type KeyCombo = {
  [K in
    | "key"
    | "ctrlKey"
    | "shiftKey"
    | "altKey"
    | "metaKey"]: KeyboardEvent[K];
};

export type KeyboardEventHandler = (e: KeyboardEvent) => void;

const modsRegexp = {
  ctrl: "([Cc]trl|CTRL|[Cc]ontrol|CONTROL)",
  cmd: "([Cc]md|CMD|[Cc]ommand|COMMAND)",
};

const keyStrMapper = [
  [/^([Ee]nter|ENTER|[Rr]eturn|RETURN)$/, "Enter"],
  [/^([Ee]scape|ESCAPE|[Ee]sc|ESC)$/, "Escape"],
  [/^([Ss]pace|SPACE)$/, " "],
  [/^([Tt]ab|TAB)$/, "Tab"],
  [/^(([Aa]rrow)?[Dd]own|↓)$/, "ArrowDown"],
  [/^(([Aa]rrow)?[Ll]eft|←)$/, "ArrowLeft"],
  [/^(([Aa]rrow)?[Rr]ight|→)$/, "ArrowRight"],
  [/^(([Aa]rrow)?[Uu]p|↑)$/, "ArrowUp"],
  [/^([Ee]nd|END)$/, "End"],
  [/^([Hh]ome|HOME)$/, "Home"],
  [/^[Pp]age ?[Dd]own$/, "PageDown"],
  [/^[Pp]age ?[Uu]p$/, "PageUp"],
] as const;

function parseKeyComboStr(keyComboStr: string) {
  const log = new Log("utils/keymap/parseKeyComboStr");

  const components = !keyComboStr.endsWith("++")
    ? keyComboStr.split("+")
    : [...keyComboStr.split("+").slice(0, -2), "+"];
  const key = components.pop();
  if (!key) {
    log.dbg(`non-mod key not found in key combo: ${keyComboStr}`);
    return;
  }
  const mods = components;

  const keyCombo: KeyCombo = {
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
    keyCombo.key = keyCombo.shiftKey ? key.toUpperCase() : key.toLowerCase();
  } else {
    for (const [regex, mapped] of keyStrMapper) {
      if (regex.test(key)) {
        keyCombo.key = mapped;
        break;
      }
    }
  }

  if (keyCombo.key === "") {
    log.dbg(`unknown key "${key}" in "${keyComboStr}"`);
    return;
  }

  return keyCombo;
}

export function createKeyboadEventHandler(
  keyComboStr: string,
  handler: KeyboardEventHandler,
): KeyboardEventHandler | undefined {
  const keyCombo = parseKeyComboStr(keyComboStr);
  if (!keyCombo) return;

  return (e) => {
    if (
      e.key === keyCombo.key &&
      e.ctrlKey === keyCombo.ctrlKey &&
      e.shiftKey === keyCombo.shiftKey &&
      e.metaKey === keyCombo.metaKey
    ) {
      handler(e);
    }
  };
}
