import type { FeatureInstances } from "../features";
import { ClickmapManager } from "./ClickmapManager";
import { KeymapManager } from "./KeymapManager";
import { NavigationObserver } from "./NavigationObserver";
import { OverlayObserver } from "./OverlayObserver";
import { StyleAppender } from "./StyleAppender";
import { beforeConduct } from "./breforeConduct";

const conductors = [
  new OverlayObserver(),
  new KeymapManager(),
  new ClickmapManager(),
  new NavigationObserver(),
  new StyleAppender(),
] as const;

export async function conductFeatures(features: FeatureInstances) {
  await beforeConduct(features);

  for (const conductor of conductors) {
    conductor.clear();
    conductor.conduct(features);
  }
}
