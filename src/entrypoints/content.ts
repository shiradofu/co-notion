import { conductFeatures } from "../conductors";
import { buildFeatures } from "../features";
import { Log } from "../utils/log";
import { Storage } from "../utils/storage";

async function setup(x?: unknown) {
  x && console.log("cofig changed:", x);
  const featureConfig = await Storage.sync.get("featureConfig");
  const features = buildFeatures(featureConfig);
  conductFeatures(features);
}

if (document.body.classList.contains("notion-body")) {
  setup();
  Storage.sync.addListener("featureConfig", setup);
} else {
  Log.dbg("non-app page detected, disabled");
}
