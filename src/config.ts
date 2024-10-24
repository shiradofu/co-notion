export type Config = {
  defaultTeamspaceOnSearchOpen: boolean;
};

export const defaultConfig: Config = {
  defaultTeamspaceOnSearchOpen: false,
};

type ConfigName = keyof Config;
export const configNames: ConfigName[] = [
  "defaultTeamspaceOnSearchOpen",
] as const;

export async function getConfigInStorage() {
  return await chrome.storage.sync.get<Config>(configNames);
}

export async function setConfigInStorage(config: Partial<Config>) {
  chrome.storage.sync.set<Config>(config);
}
