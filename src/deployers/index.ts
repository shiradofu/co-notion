import type { FeatureInstanceArrRO } from "../features";
import { ClickmapManager } from "./ClickmapManager";
import { DynamicStyleManager } from "./DynamicStyleManager";
import { KeymapManager } from "./KeymapManager";
import { NavigationObserver } from "./NavigationObserver";
import { OverlayObserver } from "./OverlayObserver";
import { SelfDeployer } from "./SelfDeployer";
import { StaticStyleManager } from "./StaticStyleManager";
import { beforeDeploy } from "./breforeDeploy";

const deployers = [
  new ClickmapManager(),
  new KeymapManager(),
  new StaticStyleManager(),
  new DynamicStyleManager(),
  new OverlayObserver(),
  new NavigationObserver(),
  new SelfDeployer(),
] as const;

export async function deploy(deployableFeatures: FeatureInstanceArrRO) {
  await beforeDeploy(deployableFeatures);

  for (const d of deployers) {
    d.cleanup(deployableFeatures);
    d.deploy(deployableFeatures);
  }
}
