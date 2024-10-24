import { writeFile } from "node:fs/promises";
import { dirname, isAbsolute, parse, resolve } from "node:path";
import chokidar from "chokidar";
import { Project, type SourceFile } from "ts-morph";
import { buildFile } from "./build";

class SourceFileAdapter {
  public absPath: string;
  public isIndex: boolean;
  private name: string;
  private dir: string;

  static fromPath(path: string) {
    const sourceFile = new Project().addSourceFileAtPath(path);
    return new SourceFileAdapter(sourceFile);
  }

  constructor(private sourceFile: SourceFile) {
    this.absPath = this.sourceFile.getFilePath();
    this.dir = dirname(this.absPath);
    this.name = parse(this.absPath).name;
    this.isIndex = this.name === "index";
  }

  toLabel() {
    return this.isIndex ? this.dir : `${this.dir}/${this.name}`;
  }

  getRelativeImportLabels() {
    const importeds = new Set<string>();
    for (const im of this.sourceFile.getImportDeclarations()) {
      const modSpec = im.getModuleSpecifierValue();
      if (!modSpec.startsWith(".")) continue;
      const imported = resolve(this.dir, modSpec);
      importeds.add(imported);
    }
    return importeds;
  }
}

class FilePathAdapter {
  constructor(private path: string) {}

  toLabel() {
    const name = parse(this.path).name;
    const dir = dirname(isAbsolute(this.path) ? this.path : resolve(this.path));
    const isIndex = name === "index";
    return isIndex ? dir : `${dir}/${name}`;
  }
}

type GraphData = {
  file?: SourceFileAdapter;
  imports: Set<string>;
  importedBy: Set<string>;
};

class DepsGraph {
  private map = new Map<string, GraphData>();

  constructor(private entrypointDir: string) {}

  async removeNode(f: FilePathAdapter) {
    const label = f.toLabel();
    const exts = ["ts", "tsx"];
    const sameLabelFile = [label, `${label}/index`]
      .flatMap((p) => exts.map((ex) => `${p}.${ex}`))
      .map((p) => {
        try {
          return new Project().addSourceFileAtPath(p);
        } catch (_) {
          return undefined;
        }
      })
      .filter((p): p is SourceFile => !!p);

    if (!sameLabelFile) {
      this.map.delete(label);
      for (const [, { imports, importedBy }] of this.map) {
        imports.delete(label);
        importedBy.delete(label);
      }
    } else {
    }
  }

  syncImports(f: SourceFileAdapter) {
    const importer = f.toLabel();
    const importeds = f.getRelativeImportLabels();

    const importerNode = this.map.get(importer);
    if (importerNode?.file?.isIndex && f.isIndex) {
      return;
    }

    for (const oldImported of importerNode?.imports ?? new Set()) {
      if (!importeds.has(oldImported))
        this.map.get(oldImported)?.importedBy?.delete(importer);
    }

    for (const imported of importeds) {
      const node = this.map.get(imported);
      node
        ? node.importedBy.add(importer)
        : this.map.set(imported, {
            imports: new Set(),
            importedBy: new Set([importer]),
          });
    }

    this.map.set(importer, {
      file: f,
      imports: importeds,
      importedBy: importerNode?.importedBy ?? new Set(),
    });
  }

  getRootImporterAbsPaths(f: SourceFileAdapter) {
    const imported = f.toLabel();
    const rootLabels = this.getRootImporterLabels(imported);
    return Array.from(rootLabels)
      .map((label) => this.map.get(label)?.file?.absPath)
      .filter((x): x is string => !!x);
  }

  private getRootImporterLabels(imported: string) {
    if (imported.startsWith(this.entrypointDir)) {
      return new Set([imported]);
    }

    const importers = this.map.get(imported)?.importedBy ?? new Set();
    let result = new Set<string>();
    for (const n of importers) {
      result = result.union(this.getRootImporterLabels(n));
    }
    return result;
  }
}

const entrypointDir = resolve("src/entrypoints");
const graph = new DepsGraph(entrypointDir);

(function initDepsGraph() {
  const project = new Project();
  for (const sourceFile of project.addSourceFilesAtPaths("src/**/*")) {
    const f = new SourceFileAdapter(sourceFile);
    graph.syncImports(f);
  }
})();

let reloadTimer: NodeJS.Timeout | null = null;
async function fireReload() {
  if (reloadTimer !== null) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(async () => {
    await writeFile("dist/reload", `${new Date().getTime()}`);
  }, 100);
}

chokidar.watch("src").on("all", async (event, path) => {
  if (!["add", "change", "unlink"].includes(event)) return;
  console.log(event, path);

  switch (event) {
    case "add":
    case "change": {
      const f = SourceFileAdapter.fromPath(path);
      graph.syncImports(f);
      const roots = graph.getRootImporterAbsPaths(f);
      if (roots.length === 0) break;
      await buildFile(roots);
      await fireReload();
      break;
    }
    case "unlink": {
      const f = new FilePathAdapter(path);
      graph.removeNode(f);
      break;
    }
  }
});

chokidar.watch("dist").on("all", async (event, path) => {
  if (!["add", "change"].includes(event)) return;
  if (path.endsWith(".html") || path.endsWith(".css")) {
    console.log(event, path);
    await fireReload();
  }
});
