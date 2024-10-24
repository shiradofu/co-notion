import { writeFile } from "node:fs/promises";
import { build } from "esbuild";
import glob from "tiny-glob";
import { defineManifest } from "../src/manifest";

export async function buildFile(path: string) {
  console.log("build", path);
  const paths = path.includes("*") ? await glob(path) : [path];
  const entryPoints: string[] = [];
  let manifestPromise = Promise.resolve();
  for (const p of paths) {
    if (p.endsWith("/manifest.ts")) {
      manifestPromise = writeManifest();
    } else {
      entryPoints.push(p);
    }
  }
  return Promise.all([manifestPromise, runEsbuild(entryPoints)]);
}

async function runEsbuild(entryPoints: string[]) {
  build({
    entryPoints,
    outdir: "dist",
    minify: false,
    bundle: true,
    define: {
      "process.env.NODE_ENV": `"${process.env.NODE_ENV ?? "development"}"`,
    },
  }).catch(() => console.error("failed to build", entryPoints));
}

async function writeManifest() {
  const manifestStr = JSON.stringify(defineManifest(), null, 2);
  await writeFile(
    "dist/manifest.json",
    new Uint8Array(Buffer.from(manifestStr)),
  ).catch((e) => console.error(e));
}

(async () => buildFile("src/*"))();
