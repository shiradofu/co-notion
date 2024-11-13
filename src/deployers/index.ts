import type { FeatureInstanceArr } from "../features";
import { ClickmapManager } from "./ClickmapManager";
import { KeymapManager } from "./KeymapManager";
import { NavigationObserver } from "./NavigationObserver";
import { OverlayObserver } from "./OverlayObserver";
import { SelfDeployer } from "./SelfDeployer";
import { StyleManager } from "./StyleManager";
import { beforeDeploy } from "./breforeDeploy";

const deployers = [
  new ClickmapManager(),
  new KeymapManager(),
  new StyleManager(),
  new OverlayObserver(),
  new NavigationObserver(),
  new SelfDeployer(),
] as const;

export async function deploy(deployableFeatures: FeatureInstanceArr) {
  await beforeDeploy(deployableFeatures);

  for (const d of deployers) {
    d.cleanup(deployableFeatures);
    d.deploy(deployableFeatures);
  }
}
