import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { type Config, getConfigInStorage, setConfigInStorage } from "../config";
import { i } from "../i18n";

const App = () => {
  const [config, setConfig] = useState<Config>({
    defaultTeamspaceOnSearchOpen: false,
  });
  const onChangeDefaultTeamspaceOnSearchOpen = useCallback(() => {
    setConfig((prev) => {
      const newState = !prev.defaultTeamspaceOnSearchOpen;
      setConfigInStorage({ defaultTeamspaceOnSearchOpen: newState });
      return {
        ...prev,
        defaultTeamspaceOnSearchOpen: newState,
      };
    });
  }, []);

  useEffect(() => {
    (async () => {
      setConfig(await getConfigInStorage());
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
          checked={config.defaultTeamspaceOnSearchOpen}
          onChange={onChangeDefaultTeamspaceOnSearchOpen}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
