import type { IconPageLinkPathnames } from "../features/ShowInlinePageLinkAsIcon";
import {
  type FeatureConfig,
  getDefaultFeatureConfig,
} from "../features/config";
import type { AvailableLang } from "../i18n";
import { merge } from "./merge";

type StorageSync = {
  featureConfig: FeatureConfig;
  hoge: { fuga: "piyo" };
};

type StorageLocal = {
  lang: AvailableLang;
  iconPageLinkPathnames: IconPageLinkPathnames;
};

type StorageType = {
  sync: StorageSync;
  local: StorageLocal;
};

export class Storage<K extends keyof StorageType> {
  constructor(private area: K) {}

  static get sync() {
    return new Storage("sync");
  }

  static get local() {
    return new Storage("local");
  }

  static async adaptToLatestInterface() {
    const featureConfig = (await Storage.sync.get("featureConfig")) ?? {};
    merge(featureConfig, getDefaultFeatureConfig());
    await Storage.sync.set("featureConfig", featureConfig);

    if ((await Storage.local.get("iconPageLinkPathnames")) === undefined) {
      Storage.local.set("iconPageLinkPathnames", {});
    }
  }

  async get<P extends keyof StorageType[K]>(key: P) {
    return (
      await chrome.storage[this.area].get<{
        [X in P]: StorageType[K][P];
      }>([key])
    )[key];
  }

  async set<P extends keyof StorageType[K]>(key: P, val: StorageType[K][P]) {
    return chrome.storage[this.area].set({ [key]: val });
  }

  addListener(
    key: keyof StorageType[K],
    fn: (changes: Record<string, chrome.storage.StorageChange>) => void,
  ) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== this.area) return;
      if (Object.keys(changes).includes(key as string)) fn(changes);
    });
  }
}
