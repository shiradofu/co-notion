import { defaultFeatureConfig } from "../config/feature";
import { merge } from "../utils/merge";
import { getFromSyncStorage, setToSyncStorage } from "../utils/storage";

if (process.env.NODE_ENV === "development") {
  import("../utils/reload").then(({ hotReload }) => {
    chrome.runtime.onInstalled.addListener(hotReload);
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (!["install", "update"].includes(reason)) return;
  const featureConfig = (await getFromSyncStorage("featureConfig")) ?? {};
  merge(featureConfig, defaultFeatureConfig);
  await setToSyncStorage("featureConfig", featureConfig);
});
