import { conductFeatures } from "../conductors";
import { buildFeatures } from "../features";
import { addListenerToSyncStorage, getFromSyncStorage } from "../utils/storage";

async function setup() {
  const featureConfig = await getFromSyncStorage("featureConfig");
  const features = buildFeatures(featureConfig);
  conductFeatures(features);
}

// TODO: wait until app has been loaded
setup();
addListenerToSyncStorage(setup);
