import { conductFeatures } from "../conductors";
import { buildFeatures } from "../features";
import { Log } from "../utils/log";
import { Storage } from "../utils/storage";

async function setup(changes?: unknown) {
  const featureConfig = await Storage.sync.get("featureConfig");
  changes && Log.dbg("cofig changed, rebuild featrues", { featureConfig });
  const features = buildFeatures(featureConfig);
  await conductFeatures(features);
}

if (document.body.classList.contains("notion-body")) {
  setup();
  Storage.sync.addListener("featureConfig", setup);
} else {
  Log.dbg("non-app page detected, disabled");
}
