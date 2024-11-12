import { conductFeatures } from "../conductors";
import { SpeculativeConductor } from "../conductors/SpeculativeConductor";
import { FeatureClasses, buildFeatures } from "../features";
import { setLang } from "../i18n";
import { Log } from "../utils/log";
import { Storage } from "../utils/storage";

const speculativeConductor = SpeculativeConductor.conduct(FeatureClasses);

async function setup(changes?: unknown) {
  changes || (await setLang());
  changes && Log.dbg("cofig changed, rebuild featrues", changes);

  const featureConfig = await Storage.sync.get("featureConfig");
  const deployableFeatures = buildFeatures(featureConfig, speculativeConductor);
  await conductFeatures(deployableFeatures);
}

if (document.body.classList.contains("notion-body")) {
  setup();
  Storage.sync.addListener("featureConfig", setup);
} else {
  Log.dbg("non-app page detected, disabled");
}
