import { conductFeatures } from "../conductors";
import { buildFeatures } from "../features";
import { Log } from "../utils/log";
import { addListenerToSyncStorage, getFromSyncStorage } from "../utils/storage";

async function setup() {
  const featureConfig = await getFromSyncStorage("featureConfig");
  const features = buildFeatures(featureConfig);
  conductFeatures(features);
}

if (document.body.classList.contains("notion-body")) {
  setup();
  addListenerToSyncStorage(setup);
} else {
  Log.dbg("non-app page detected, disabled");
}
