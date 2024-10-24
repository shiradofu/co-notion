import { writeFile } from "node:fs/promises";
import chokidar from "chokidar";
import { buildFile } from "./build";

const fireReload = async () =>
  await writeFile("dist/reload", `${new Date().getTime()}`);

chokidar.watch(["src", "dist"]).on("all", async (event, path) => {
  if (!["add", "change"].includes(event)) return;
  if (path.endsWith(".ts")) {
    console.log("build", path);
    await buildFile(path);
    await fireReload();
  } else if (path.endsWith(".html") || path.endsWith(".css")) {
    await fireReload();
  }
});
