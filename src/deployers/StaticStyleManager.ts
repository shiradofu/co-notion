import { AppCrawler } from "../crawlers/AppCrawler";
import type { FeatureInstanceArrRO } from "../features";
import { Log } from "../utils/log";
import type { Deployer } from "./types";

export interface WithStaticStyle {
  hasStaticStyle: true;
}
const uniqueKey: keyof WithStaticStyle = "hasStaticStyle";

export class StaticStyleManager implements Deployer {
  private app = new AppCrawler();
  private classNames: string[] = [];

  @Log.thrownInMethodAsync
  async deploy(deployableFeatures: FeatureInstanceArrRO) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
    const appRoot = await this.app.getAppRoot("must", { wait: "long" });
    this.classNames = targetFeatures.map((f) => f.constructor.name);
    appRoot.classList.add(...this.classNames);
  }

  @Log.thrownInMethodAsync
  async cleanup(newDeployableFeatures: FeatureInstanceArrRO) {
    const enabled = new Set(
      newDeployableFeatures
        .filter((f) => uniqueKey in f)
        .map((f) => f.constructor.name),
    );

    const notEnabledAnymore = this.classNames.filter((c) => !enabled.has(c));
    if (notEnabledAnymore.length === 0) return;

    const appRoot = await this.app.getAppRoot("must", { wait: "long" });
    appRoot.classList.remove(...notEnabledAnymore);
    this.classNames = [];
  }
}
