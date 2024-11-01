export async function hotReload() {
  const readFile = (path: string) =>
    fetch(path, { mode: "same-origin" })
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("loadend", () => resolve(reader.result));
            reader.addEventListener("error", () => reject(reader.error));
            reader.readAsText(blob);
          }),
      );

  const reload = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (_tabs) => {
      // const tab = tabs.at(0);
      // if (tab && tab.id !== undefined) chrome.tabs.reload(tab.id);
      chrome.runtime.reload();
    });
  };

  const reloadFile = chrome.runtime.getURL("reload");
  readFile(reloadFile).then((lastModified) => {
    chrome.alarms.create({ delayInMinutes: 0.01 });
    chrome.alarms.onAlarm.addListener(() =>
      readFile(reloadFile).then((newLastModified) => {
        console.log(`hot-reload: ${newLastModified}`);
        newLastModified !== lastModified
          ? reload()
          : chrome.alarms.create({ delayInMinutes: 0.01 });
      }),
    );
  });
}
