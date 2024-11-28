export const IS_MACOS = /Mac OS/.test(navigator.userAgent);
export const CMD_OR_CTRL =
  process.env.NODE_ENV === "document" ? "⌘/Ctrl" : IS_MACOS ? "⌘" : "Ctrl";
