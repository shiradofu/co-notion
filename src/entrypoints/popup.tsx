import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { type FeatureConfig, defaultFeatureConfig } from "../config/feature";
import { i } from "../i18n";
import { getFromSyncStorage, setToSyncStorage } from "../utils/storage";

const App = () => {
  const [config, setConfig] = useState<FeatureConfig>(defaultFeatureConfig);
  const onChangeDefaultTeamspaceOnSearchOpen = useCallback(() => {
    setConfig((prev) => {
      const isEnabled = !prev.defaultTeamspaceOnSearchOpen.isEnabled;
      setToSyncStorage("featureConfig", {
        defaultTeamspaceOnSearchOpen: { isEnabled },
      });
      return {
        ...prev,
        defaultTeamspaceOnSearchOpen: { isEnabled },
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
        <label htmlFor="defaultTeamspaceOnSearchOpen">
          {i("defaultTeamspaceOnSearchOpen")}
        </label>
        <input
          id="defaultTeamspaceOnSearchOpen"
          type="checkbox"
          checked={config.defaultTeamspaceOnSearchOpen.isEnabled}
          onChange={onChangeDefaultTeamspaceOnSearchOpen}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
