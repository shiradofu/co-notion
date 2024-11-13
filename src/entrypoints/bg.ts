import { getDefaultFeatureConfig } from "../features";
import { merge } from "../utils/merge";
import { Storage } from "../utils/storage";

if (process.env.NODE_ENV === "development") {
  import("../utils/reload").then(({ hotReload }) => {
    chrome.runtime.onInstalled.addListener(hotReload);
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (!["install", "update"].includes(reason)) return;
  const featureConfig = (await Storage.sync.get("featureConfig")) ?? {};
  merge(featureConfig, getDefaultFeatureConfig());
  await Storage.sync.set("featureConfig", featureConfig);

  if ((await Storage.local.get("iconPageLinkPathnames")) === undefined) {
    Storage.local.set("iconPageLinkPathnames", {});
  }
});
