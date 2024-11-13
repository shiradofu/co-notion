import { writeFile } from "node:fs/promises";
import { build } from "esbuild";
import glob from "tiny-glob";
import { defineManifest } from "../src/entrypoints/manifest";

process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

export async function buildFiles(pathExpressions: string[]) {
  const paths = (
    await Promise.all(
      pathExpressions.map(async (p) => {
        return p.includes("*") ? await glob(p) : [p];
      }),
    )
  ).flat();

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
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
    },
  }).catch(() => console.error("failed to build", entryPoints));
  console.log("build");
}

async function writeManifest() {
  const manifestStr = JSON.stringify(defineManifest(), null, 2);
  await writeFile(
    "dist/manifest.json",
    new Uint8Array(Buffer.from(manifestStr)),
  ).catch((e) => console.error(e));
}

(async () => buildFiles(["src/entrypoints/*.ts"]))();
