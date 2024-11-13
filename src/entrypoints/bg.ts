import { Storage } from "../utils/storage";

if (process.env.NODE_ENV === "development") {
  import("../utils/reload").then(({ hotReload }) => {
    chrome.runtime.onInstalled.addListener(hotReload);
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (!["install", "update"].includes(reason)) return;
  Storage.adaptToLatestInterface();
});
