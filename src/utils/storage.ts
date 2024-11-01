import type { FeatureConfig } from "../config/feature";

type Storage = {
  featureConfig: FeatureConfig;
};

export async function getFromSyncStorage(key: keyof Storage) {
  return (await chrome.storage.sync.get<{ [key]: Storage[typeof key] }>([key]))[
    key
  ];
}

export async function setToSyncStorage(
  key: keyof Storage,
  data: Partial<Storage[typeof key]>,
) {
  chrome.storage.sync.set<{ [key]: typeof data }>({
    [key]: data,
  });
}

export function addListenerToSyncStorage(
  fn: (changes: Record<string, chrome.storage.StorageChange>) => void,
) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    fn(changes);
  });
}
