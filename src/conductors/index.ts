import type { FeatureInstanceArr } from "../features";
import { ClickmapManager } from "./ClickmapManager";
import { KeymapManager } from "./KeymapManager";
import { NavigationObserver } from "./NavigationObserver";
import { OverlayObserver } from "./OverlayObserver";
import { SelfConductor } from "./SelfConductor";
import { StyleAppender } from "./StyleAppender";
import { beforeConduct } from "./breforeConduct";

const conductors = [
  new OverlayObserver(),
  new KeymapManager(),
  new ClickmapManager(),
  new NavigationObserver(),
  new StyleAppender(),
  new SelfConductor(),
] as const;

export async function conductFeatures(deployableFeatures: FeatureInstanceArr) {
  await beforeConduct(deployableFeatures);

  for (const conductor of conductors) {
    conductor.clear(deployableFeatures);
    conductor.conduct(deployableFeatures);
  }
}
