import { writeFile } from "node:fs/promises";
import chokidar from "chokidar";
import { buildFiles } from "./build";

process.env.NODE_ENV = "development";

function debounce<A extends unknown[]>(
  callback: (...args: A) => unknown,
  delay = 250,
): (...args: A) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

async function fireReload() {
  writeFile("dist/.reload", `${new Date().getTime()}`);
}

const fireReloadDebounced = debounce(fireReload);
const buildAndReloadDebounced = debounce(
  async (files: string[] = ["src/entrypoints/*.ts"]) => {
    await buildFiles(files);
    fireReload();
  },
);

chokidar
  .watch("src", { ignoreInitial: true })
  .on("all", async (event: string, path: string) => {
    if (!["add", "change"].includes(event)) return;
    if (path.endsWith("test.ts")) return;
    console.log(event, path);
    buildAndReloadDebounced();
  });

chokidar
  .watch("dist", { ignoreInitial: true })
  .on("all", async (event, path) => {
    if (!["add", "change"].includes(event)) return;
    if (path.endsWith(".html") || path.endsWith(".css")) {
      console.log(event, path);
      fireReloadDebounced();
    }
  });
