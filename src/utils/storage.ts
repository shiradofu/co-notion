import type { FeatureConfig } from "../config/feature";

type StorageSync = {
  featureConfig: FeatureConfig;
  hoge: { fuga: "piyo" };
};

type StorageLocal = {
  iconPageLinks: string[];
  lang: string;
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
