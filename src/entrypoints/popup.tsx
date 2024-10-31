import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { type FeatureConfig, defaultFeatureConfig } from "../config/feature";
import { i } from "../i18n";
import { getFromSyncStorage, setToSyncStorage } from "../utils/storage";

const App = () => {
  const [config, setConfig] = useState<FeatureConfig>(defaultFeatureConfig);
  const onChangeSetDefaultTeamspaceOnSearchOpen = useCallback(() => {
    setConfig((prev) => {
      const isEnabled = !prev.setDefaultTeamspaceOnSearchOpen.isEnabled;
      setToSyncStorage("featureConfig", {
        setDefaultTeamspaceOnSearchOpen: { isEnabled },
      });
      return {
        ...prev,
        setDefaultTeamspaceOnSearchOpen: { isEnabled },
      };
    });
  }, []);

  useEffect(() => {
    (async () => {
      setConfig(await getFromSyncStorage("featureConfig"));
    })();
  }, []);

  return (
    <div className="App">
      <div className="ConfigTitle">
        <img src="./assets/icon-512.png" alt="notion utils logo" />
        <span>notion-utils</span>
      </div>
      <hr className="ConfigBorder" />
      <div className="ConfigGrid">
        <label htmlFor="setDefaultTeamspaceOnSearchOpen">
          {i("setDefaultTeamspaceOnSearchOpen")}
        </label>
        <input
          id="setDefaultTeamspaceOnSearchOpen"
          type="checkbox"
          checked={config.setDefaultTeamspaceOnSearchOpen.isEnabled}
          onChange={onChangeSetDefaultTeamspaceOnSearchOpen}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
