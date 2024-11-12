import type { Manifest } from "webextension-polyfill";
import pkg from "../../package.json";

export function defineManifest(): Manifest.WebExtensionManifest {
  const iconPath = "./assets/icon-512.png";

  const permissions = ["storage"];
  process.env.NODE_ENV === "development" && permissions.push("alarm");

  return {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    icons: { 16: iconPath, 48: iconPath, 128: iconPath },
    action: {
      default_icon: iconPath,
      default_popup: "./popup.html",
    },
    background: {
      service_worker: "./bg.js",
    },
    content_scripts: [
      {
        matches: ["https://www.notion.so/*"],
        js: ["./content.js"],
      },
    ],
    permissions,
  };
}
